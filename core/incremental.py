from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Dict, List, Optional

import pandas as pd
from sqlalchemy import MetaData, Table, inspect, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.engine import Engine


def ensure_incremental_schema(engine: Engine) -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS pipeline_incremental_state (
                    dataset_name VARCHAR(100) PRIMARY KEY,
                    target_table VARCHAR(100),
                    load_strategy VARCHAR(20),
                    primary_key_columns TEXT,
                    incremental_column VARCHAR(100),
                    hash_columns TEXT,
                    last_watermark_value TEXT,
                    last_rows_loaded BIGINT,
                    last_source_rows BIGINT,
                    last_loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
        )


def _quote_table_name(table_name: str) -> str:
    if "." in table_name:
        schema_name, bare_table_name = table_name.split(".", 1)
        return f'"{schema_name}"."{bare_table_name}"'

    return f'"{table_name}"'


def _normalize_datetime_series(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce")


def _row_hash(frame: pd.DataFrame, columns: List[str]) -> pd.Series:
    if not columns:
        columns = list(frame.columns)

    digest_source = frame[columns].astype(str).fillna("").agg("|".join, axis=1)
    return digest_source.apply(lambda value: hashlib.sha256(value.encode("utf-8")).hexdigest())


def _load_incremental_state(engine: Engine, dataset_name: str) -> Optional[Dict[str, str]]:
    query = text(
        """
        SELECT
            dataset_name,
            target_table,
            load_strategy,
            primary_key_columns,
            incremental_column,
            hash_columns,
            last_watermark_value
        FROM pipeline_incremental_state
        WHERE dataset_name = :dataset_name
        """
    )

    with engine.begin() as conn:
        row = conn.execute(query, {"dataset_name": dataset_name}).mappings().first()

    return dict(row) if row else None


def _save_incremental_state(
    engine: Engine,
    dataset_name: str,
    target_table: str,
    load_strategy: str,
    primary_key_columns: List[str],
    incremental_column: Optional[str],
    hash_columns: List[str],
    last_watermark_value: Optional[str],
    last_rows_loaded: int,
    last_source_rows: int,
) -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                INSERT INTO pipeline_incremental_state (
                    dataset_name,
                    target_table,
                    load_strategy,
                    primary_key_columns,
                    incremental_column,
                    hash_columns,
                    last_watermark_value,
                    last_rows_loaded,
                    last_source_rows,
                    last_loaded_at
                )
                VALUES (
                    :dataset_name,
                    :target_table,
                    :load_strategy,
                    :primary_key_columns,
                    :incremental_column,
                    :hash_columns,
                    :last_watermark_value,
                    :last_rows_loaded,
                    :last_source_rows,
                    :last_loaded_at
                )
                ON CONFLICT (dataset_name)
                DO UPDATE SET
                    target_table = EXCLUDED.target_table,
                    load_strategy = EXCLUDED.load_strategy,
                    primary_key_columns = EXCLUDED.primary_key_columns,
                    incremental_column = EXCLUDED.incremental_column,
                    hash_columns = EXCLUDED.hash_columns,
                    last_watermark_value = EXCLUDED.last_watermark_value,
                    last_rows_loaded = EXCLUDED.last_rows_loaded,
                    last_source_rows = EXCLUDED.last_source_rows,
                    last_loaded_at = EXCLUDED.last_loaded_at;
                """
            ),
            {
                "dataset_name": dataset_name,
                "target_table": target_table,
                "load_strategy": load_strategy,
                "primary_key_columns": ",".join(primary_key_columns),
                "incremental_column": incremental_column,
                "hash_columns": ",".join(hash_columns),
                "last_watermark_value": last_watermark_value,
                "last_rows_loaded": last_rows_loaded,
                "last_source_rows": last_source_rows,
                "last_loaded_at": datetime.now(),
            },
        )


def _ensure_unique_index(engine: Engine, table_name: str, column_names: List[str]) -> None:
    if not column_names:
        return

    index_name = f"ux_{table_name.replace('.', '_')}_{'_'.join(column_names)}"
    quoted_columns = ", ".join(f'"{column}"' for column in column_names)

    with engine.begin() as conn:
        conn.execute(
            text(
                f"CREATE UNIQUE INDEX IF NOT EXISTS {index_name} ON {_quote_table_name(table_name)} ({quoted_columns});"
            )
        )


def _filter_by_watermark(df: pd.DataFrame, watermark_column: str, last_watermark_value: Optional[str]) -> pd.DataFrame:
    if watermark_column not in df.columns:
        return df.copy()

    if not last_watermark_value:
        return df.copy()

    source_values = _normalize_datetime_series(df[watermark_column])
    last_value = pd.to_datetime(last_watermark_value, errors="coerce")

    if pd.isna(last_value):
        return df.copy()

    return df.loc[source_values > last_value].copy()


def _apply_hash_change_detection(
    engine: Engine,
    df: pd.DataFrame,
    table_name: str,
    primary_key_columns: List[str],
    hash_columns: List[str],
) -> pd.DataFrame:
    if not primary_key_columns or not hash_columns or df.empty:
        return df.copy()

    reflected = MetaData()
    reflected.reflect(bind=engine, only=[table_name.split(".")[-1]])
    table = reflected.tables.get(table_name.split(".")[-1])

    if table is None:
        return df.copy()

    selected_columns = list(dict.fromkeys(primary_key_columns + hash_columns))
    target_df = pd.read_sql(
        text(f"SELECT {', '.join(f'\"{column}\"' for column in selected_columns)} FROM {_quote_table_name(table_name)}"),
        engine,
    )

    if target_df.empty:
        return df.copy()

    source = df.copy()
    source["_source_hash"] = _row_hash(source, hash_columns)

    target = target_df.copy()
    target["_target_hash"] = _row_hash(target, hash_columns)

    merged = source.merge(
        target[list(dict.fromkeys(primary_key_columns + ["_target_hash"]))],
        on=primary_key_columns,
        how="left",
    )

    changed = merged[merged["_target_hash"].isna() | (merged["_source_hash"] != merged["_target_hash"])]

    return changed.drop(columns=["_source_hash", "_target_hash"], errors="ignore")


def _upsert_dataframe(
    engine: Engine,
    table_name: str,
    df: pd.DataFrame,
    primary_key_columns: List[str],
) -> None:
    if df.empty:
        return

    metadata = MetaData()
    table_key = table_name.split(".")[-1]
    metadata.reflect(bind=engine, only=[table_key])
    target_table = Table(table_key, metadata, autoload_with=engine)

    update_columns = [column.name for column in target_table.columns if column.name not in primary_key_columns]

    records = df.to_dict(orient="records")

    with engine.begin() as conn:
        for start in range(0, len(records), 500):
            batch = records[start : start + 500]
            statement = pg_insert(target_table).values(batch)
            statement = statement.on_conflict_do_update(
                index_elements=primary_key_columns,
                set_={column: getattr(statement.excluded, column) for column in update_columns},
            )
            conn.execute(statement)


def load_incremental_dataset(dataset, df: pd.DataFrame, engine: Engine) -> Dict[str, object]:
    config = dataset.config or {}
    primary_key_columns = list(dict.fromkeys(config.get("primary_key", [])))
    incremental_column = config.get("incremental_column") or config.get("watermark_column")
    hash_columns = list(dict.fromkeys(config.get("hash_columns", [])))

    if not primary_key_columns:
        raise ValueError(
            f"Dataset '{dataset.name}' must define primary_key for incremental loading."
        )

    _ensure_unique_index(engine, dataset.table, primary_key_columns)

    state = _load_incremental_state(engine, dataset.name)
    last_watermark_value = state["last_watermark_value"] if state else None

    candidates = _filter_by_watermark(df, incremental_column, last_watermark_value)

    if hash_columns:
        candidates = _apply_hash_change_detection(
            engine=engine,
            df=candidates,
            table_name=dataset.table,
            primary_key_columns=primary_key_columns,
            hash_columns=hash_columns,
        )

    if not candidates.empty:
        _upsert_dataframe(engine, dataset.table, candidates, primary_key_columns)

    new_watermark_value: Optional[str] = None
    if incremental_column and incremental_column in df.columns and not df.empty:
        source_values = _normalize_datetime_series(df[incremental_column])
        if source_values.notna().any():
            max_value = source_values.max()
            if pd.notna(max_value):
                new_watermark_value = max_value.isoformat()

    _save_incremental_state(
        engine=engine,
        dataset_name=dataset.name,
        target_table=dataset.table,
        load_strategy="incremental",
        primary_key_columns=primary_key_columns,
        incremental_column=incremental_column,
        hash_columns=hash_columns,
        last_watermark_value=new_watermark_value or last_watermark_value,
        last_rows_loaded=int(len(candidates)),
        last_source_rows=int(len(df)),
    )

    return {
        "rows_loaded": int(len(candidates)),
        "load_mode": "INCREMENTAL",
        "load_strategy": "incremental",
        "incremental_column": incremental_column,
        "watermark_value": new_watermark_value or last_watermark_value,
        "hash_based_change_detection": bool(hash_columns),
        "upserted": not candidates.empty,
    }