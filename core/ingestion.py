from __future__ import annotations

import time
from datetime import datetime
from pathlib import Path
from typing import Optional

import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Engine

from core.schema import ensure_table_exists, quote_table_name
from core.incremental import load_incremental_dataset
from core.validation import validate_dataset
from models.dataset import Dataset
from utils.db import get_engine


class DatasetIngestionError(Exception):
    """Raised whenever a dataset cannot be ingested."""
    pass


def _safe_to_sql(
    df: pd.DataFrame,
    table: str,
    engine: Engine,
    if_exists: str = "append",
    chunksize: int = 1000,
) -> None:
    """
    Load a DataFrame into PostgreSQL with automatic type coercion.

    Strategy:
    1. Try inserting the DataFrame as-is with chunksize to avoid parameter limits.
    2. If a column type error occurs, cast all object/mixed columns to TEXT and retry.
    3. If still failing, cast the entire DataFrame to TEXT and retry.
    Never raises on type mismatch — always finds a way to load.
    """
    def _load(frame: pd.DataFrame) -> None:
        frame.to_sql(
            table,
            engine,
            if_exists=if_exists,
            index=False,
            method="multi",
            chunksize=chunksize,
        )
    try:
        _load(df)
        return
    except Exception as e1:
        err = str(e1).lower()
        # Type mismatch or encoding issue — coerce object columns to string
        if any(kw in err for kw in ("invalid input", "type", "encoding", "unicode", "value")):
            df2 = df.copy()
            for col in df2.columns:
                if df2[col].dtype == object or str(df2[col].dtype) == "string":
                    df2[col] = df2[col].astype(str).replace("nan", None).replace("<NA>", None)
            try:
                _load(df2)
                return
            except Exception:
                pass

    # Last resort: cast everything to TEXT
    df3 = df.copy()
    for col in df3.columns:
        df3[col] = df3[col].astype(str).replace("nan", None).replace("None", None).replace("<NA>", None)
    _load(df3)


def _read_dataset(dataset: Dataset) -> pd.DataFrame:
    """
    Read source data via the ConnectorRegistry (v2.0).

    Supports CSV, Excel, JSON, Parquet, S3, Azure Blob, GCS, REST API.
    Falls back to pd.read_csv for legacy datasets without an explicit source block.
    """
    config = dataset.config or {}
    source_cfg = config.get("source", {})

    if source_cfg:
        # Explicit source block → use connector registry
        source_type: str = source_cfg.get("type", "csv").lower()
        try:
            from core.connectors.registry import ConnectorRegistry
            connector = ConnectorRegistry.get(source_type, source_cfg)
            return connector.read()
        except ImportError as exc:
            raise DatasetIngestionError(str(exc)) from exc
    else:
        # Legacy path — read from dataset.file with auto format detection
        file_path = dataset.file
        file_ext = Path(str(file_path)).suffix.lower()

        if file_ext in (".xlsx", ".xls"):
            return pd.read_excel(file_path, engine="openpyxl")
        if file_ext == ".json":
            return pd.read_json(file_path)
        if file_ext in (".parquet", ".pq"):
            return pd.read_parquet(file_path)

        return pd.read_csv(file_path)

def ingest_dataset(dataset: Dataset, df: Optional[pd.DataFrame] = None) -> Dataset:
    """
    Ingest a single dataset into PostgreSQL.

    Parameters
    ----------
    dataset : Dataset
    df : pd.DataFrame, optional
        Pre-read DataFrame. If provided, skips the source read entirely.
        Pass this from pipeline.py to avoid downloading cloud files twice.
    """

    # --------------------------------------------------
    # Dataset Registration Check
    # --------------------------------------------------

    if not dataset.registered:
        raise DatasetIngestionError(
            f"Dataset '{dataset.name}' is not registered."
        )

    # --------------------------------------------------
    # Schema Validation
    # --------------------------------------------------

    validation = validate_dataset(dataset)

    dataset.schema_valid = validation["valid"]

    if not dataset.schema_valid:

        message = (
            f"\nSchema validation failed for '{dataset.name}'\n\n"
            f"Missing Columns : {validation['missing']}\n"
            f"Extra Columns   : {validation['extra']}"
        )

        raise DatasetIngestionError(message)

    # --------------------------------------------------
    # Start Timer
    # --------------------------------------------------

    dataset.started_at = datetime.now()

    start = time.time()

    # --------------------------------------------------
    # Read source data via ConnectorRegistry (v2.0)
    # Skip if df was already provided by the caller (pipeline.py read-once pattern)
    # --------------------------------------------------

    if df is None:
        df = _read_dataset(dataset)

    # --------------------------------------------------
    # Database Connection
    # --------------------------------------------------

    engine = get_engine()

    dataset.auto_created_table = ensure_table_exists(
        dataset,
        df,
        engine,
    )

    # --------------------------------------------------
    # Load Strategy
    # --------------------------------------------------

    strategy = (dataset.config or {}).get(
        "load_strategy",
        "replace",
    )

    dataset.load_strategy = str(strategy).lower()
    dataset.incremental_column = (dataset.config or {}).get("incremental_column") or (dataset.config or {}).get("watermark_column")

    if strategy.lower() == "incremental":
        load_result = load_incremental_dataset(dataset, df, engine)
        dataset.rows_loaded = load_result["rows_loaded"]
        dataset.load_mode = load_result["load_mode"]
        dataset.watermark_value = load_result["watermark_value"]
    elif strategy.lower() == "replace":
        target_table = dataset.table or dataset.name
        with engine.begin() as conn:
            conn.execute(text(f"TRUNCATE TABLE {quote_table_name(target_table)};"))

        _safe_to_sql(df, target_table, engine)

        dataset.load_mode = "FULL"
        dataset.rows_loaded = len(df)
        dataset.watermark_value = None
    else:
        target_table = dataset.table or dataset.name
        _safe_to_sql(df, target_table, engine, if_exists="append")

        dataset.load_mode = "APPEND"
        dataset.rows_loaded = len(df)
        dataset.watermark_value = None

    if strategy.lower() == "incremental":
        pass

    # --------------------------------------------------
    # Metadata
    # --------------------------------------------------

    dataset.finished_at = datetime.now()

    if strategy.lower() != "incremental":
        dataset.rows_loaded = len(df)

    dataset.duration_seconds = round(
        time.time() - start,
        2,
    )

    dataset.load_status = "SUCCESS"

    return dataset