from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple

import pandas as pd
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


@dataclass(frozen=True)
class ColumnDefinition:
    name: str
    postgres_type: str


def quote_identifier(identifier: str) -> str:
    return '"' + identifier.replace('"', '""') + '"'


def quote_table_name(table_name: str) -> str:
    if "." in table_name:
        schema_name, bare_table_name = table_name.split(".", 1)
        return f"{quote_identifier(schema_name)}.{quote_identifier(bare_table_name)}"

    return quote_identifier(table_name)


def _clean_series(series: pd.Series) -> pd.Series:
    cleaned = series.dropna()

    if cleaned.empty:
        return cleaned

    if pd.api.types.is_string_dtype(cleaned) or cleaned.dtype == object:
        cleaned = cleaned.astype(str).str.strip()
        cleaned = cleaned[cleaned != ""]

    return cleaned


def _is_bool_series(series: pd.Series) -> bool:
    if pd.api.types.is_bool_dtype(series):
        return True

    if pd.api.types.is_numeric_dtype(series):
        return False

    cleaned = _clean_series(series)

    if cleaned.empty:
        return False

    if pd.api.types.is_bool_dtype(cleaned):
        return True

    allowed_values = {"true", "false", "t", "f", "yes", "no"}
    normalized = {str(value).strip().lower() for value in cleaned.unique()}

    return normalized.issubset(allowed_values)


def _is_datetime_series(series: pd.Series) -> bool:
    if pd.api.types.is_datetime64_any_dtype(series):
        return True

    cleaned = _clean_series(series)

    if cleaned.empty:
        return False

    if pd.api.types.is_numeric_dtype(cleaned):
        return False

    parsed = pd.to_datetime(cleaned, errors="coerce", format="mixed")

    return parsed.notna().all()


def _is_numeric_series(series: pd.Series) -> Tuple[bool, bool]:
    cleaned = _clean_series(series)

    if cleaned.empty:
        return False, False

    numeric = pd.to_numeric(cleaned, errors="coerce")

    if numeric.isna().any():
        return False, False

    is_integer = bool((numeric % 1 == 0).all())

    return True, is_integer


def infer_postgres_type(series: pd.Series) -> str:
    if _is_bool_series(series):
        return "BOOLEAN"

    if pd.api.types.is_integer_dtype(series):
        max_val = int(series.abs().max()) if not series.empty else 0
        return "BIGINT" if max_val > 2_147_483_647 else "INTEGER"

    is_numeric, is_integer = _is_numeric_series(series)

    if is_numeric:
        if is_integer and not series.isna().any():
            return "INTEGER"

        return "DOUBLE PRECISION"

    if _is_datetime_series(series):
        return "TIMESTAMP"

    return "TEXT"


def infer_column_definitions(df: pd.DataFrame) -> List[ColumnDefinition]:
    definitions: List[ColumnDefinition] = []

    for column_name in df.columns:
        definitions.append(
            ColumnDefinition(
                name=column_name,
                postgres_type=infer_postgres_type(df[column_name]),
            )
        )

    return definitions


def build_create_table_sql(table_name: str, df: pd.DataFrame) -> str:
    column_definitions = infer_column_definitions(df)

    column_sql = ",\n    ".join(
        f"{quote_identifier(column.name)} {column.postgres_type}"
        for column in column_definitions
    )

    return (
        f"CREATE TABLE IF NOT EXISTS {quote_table_name(table_name)} (\n"
        f"    {column_sql}\n"
        f");"
    )


def ensure_table_exists(dataset, df: pd.DataFrame, engine: Engine) -> bool:
    if not dataset.table:
        raise ValueError(f"Dataset '{dataset.name}' is missing a target table.")

    inspector = inspect(engine)

    schema_name = None
    table_name = dataset.table

    if "." in dataset.table:
        schema_name, table_name = dataset.table.split(".", 1)

    table_exists = inspector.has_table(table_name, schema=schema_name)

    if table_exists:
        return False

    create_sql = build_create_table_sql(dataset.table, df)

    with engine.begin() as conn:
        conn.execute(text(create_sql))

    return True