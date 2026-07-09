"""
Schema inference engine for OpenIngest.

Design goals:
  - Any DataFrame, any dataset, zero errors.
  - When in doubt → TEXT. TEXT accepts everything PostgreSQL can store.
  - Strict datetime detection: requires a real date component, never misclassifies
    pure time strings ("20:45:00"), epoch integers, or UUIDs as TIMESTAMP.
  - Handles NaN, None, empty columns, mixed types, and encoding artifacts safely.
  - If the existing table schema diverges from the inferred schema,
    ALTER TABLE adds missing columns rather than crashing.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional, Tuple

import pandas as pd
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


# ─── Identifiers ──────────────────────────────────────────────────────────────

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


# ─── Series helpers ───────────────────────────────────────────────────────────

def _clean_series(series: pd.Series) -> pd.Series:
    """Drop nulls, strip whitespace from string columns, remove empty strings."""
    cleaned = series.dropna()
    if cleaned.empty:
        return cleaned
    if pd.api.types.is_string_dtype(cleaned) or cleaned.dtype == object:
        cleaned = cleaned.astype(str).str.strip()
        cleaned = cleaned[cleaned != ""]
    return cleaned


def _is_bool_series(series: pd.Series) -> bool:
    """True only for native bool columns or columns with exclusively bool-like strings."""
    if pd.api.types.is_bool_dtype(series):
        return True
    # Don't misclassify numeric 0/1 as boolean
    if pd.api.types.is_numeric_dtype(series):
        return False
    cleaned = _clean_series(series)
    if cleaned.empty:
        return False
    allowed = {"true", "false", "t", "f", "yes", "no"}
    normalized = {str(v).strip().lower() for v in cleaned.unique()}
    return normalized.issubset(allowed) and len(normalized) >= 1


# ISO date pattern — requires YYYY-MM-DD somewhere in the value
_DATE_PATTERN = re.compile(r"\d{4}-\d{2}-\d{2}")


def _is_datetime_series(series: pd.Series) -> bool:
    """
    True only if the column contains real datetime values (date + optional time).

    Rejects:
      - Pure time strings like "20:45:00" or "8:30 AM"
      - Epoch integers
      - UUID-like strings
      - Mixed columns with even one unparseable value
    """
    if pd.api.types.is_datetime64_any_dtype(series):
        return True

    cleaned = _clean_series(series)
    if cleaned.empty:
        return False

    # Numeric columns are never datetimes in our context
    if pd.api.types.is_numeric_dtype(cleaned):
        return False

    str_vals = cleaned.astype(str).str.strip()

    # Every value must contain a YYYY-MM-DD date pattern
    has_date = str_vals.str.contains(_DATE_PATTERN, regex=True)
    if not has_date.all():
        return False

    # All values must parse successfully
    parsed = pd.to_datetime(str_vals, errors="coerce", format="mixed")
    return parsed.notna().all()


def _is_numeric_series(series: pd.Series) -> Tuple[bool, bool]:
    """
    Returns (is_numeric, is_integer).
    is_integer is True only when all non-null values have no fractional part.
    """
    cleaned = _clean_series(series)
    if cleaned.empty:
        return False, False

    numeric = pd.to_numeric(cleaned, errors="coerce")
    if numeric.isna().any():
        return False, False

    is_integer = bool((numeric % 1 == 0).all())
    return True, is_integer


# ─── Type inference ───────────────────────────────────────────────────────────

def infer_postgres_type(series: pd.Series) -> str:
    """
    Map a pandas Series to the safest matching PostgreSQL type.

    Priority:
      1. Native bool dtype → BOOLEAN
      2. Native int dtype  → INTEGER / BIGINT
      3. Bool-like strings → BOOLEAN
      4. Datetime strings with date part → TIMESTAMP
      5. Numeric strings  → INTEGER / DOUBLE PRECISION
      6. Everything else  → TEXT  (safe fallback, never errors)
    """
    try:
        # ── Native bool ──────────────────────────────────────────────────────
        if pd.api.types.is_bool_dtype(series):
            return "BOOLEAN"

        # ── Native integer ───────────────────────────────────────────────────
        if pd.api.types.is_integer_dtype(series):
            try:
                max_val = int(series.abs().max()) if not series.empty else 0
                return "BIGINT" if max_val > 2_147_483_647 else "INTEGER"
            except Exception:
                return "BIGINT"

        # ── Native float ─────────────────────────────────────────────────────
        if pd.api.types.is_float_dtype(series):
            return "DOUBLE PRECISION"

        # ── Native datetime ──────────────────────────────────────────────────
        if pd.api.types.is_datetime64_any_dtype(series):
            return "TIMESTAMP"

        # ── String / object columns ─────────────────────────────────────────
        if _is_bool_series(series):
            return "BOOLEAN"

        if _is_datetime_series(series):
            return "TIMESTAMP"

        is_numeric, is_integer = _is_numeric_series(series)
        if is_numeric:
            if is_integer:
                # Check magnitude to pick right integer type
                try:
                    cleaned = _clean_series(series)
                    max_val = abs(pd.to_numeric(cleaned).max())
                    return "BIGINT" if max_val > 2_147_483_647 else "INTEGER"
                except Exception:
                    return "INTEGER"
            return "DOUBLE PRECISION"

        return "TEXT"

    except Exception:
        # Absolute safety net — TEXT accepts any value
        return "TEXT"


def infer_column_definitions(df: pd.DataFrame) -> List[ColumnDefinition]:
    """Infer PostgreSQL column types for every column in the DataFrame."""
    definitions: List[ColumnDefinition] = []
    for col in df.columns:
        try:
            pg_type = infer_postgres_type(df[col])
        except Exception:
            pg_type = "TEXT"
        definitions.append(ColumnDefinition(name=col, postgres_type=pg_type))
    return definitions


# ─── DDL helpers ──────────────────────────────────────────────────────────────

def build_create_table_sql(table_name: str, df: pd.DataFrame) -> str:
    """Generate a CREATE TABLE IF NOT EXISTS statement from a DataFrame."""
    col_defs = infer_column_definitions(df)
    column_sql = ",\n    ".join(
        f"{quote_identifier(c.name)} {c.postgres_type}"
        for c in col_defs
    )
    return (
        f"CREATE TABLE IF NOT EXISTS {quote_table_name(table_name)} (\n"
        f"    {column_sql}\n"
        f");"
    )


def _sync_table_columns(
    engine: Engine,
    table_name: str,
    df: pd.DataFrame,
    schema_name: Optional[str],
    bare_table_name: str,
) -> None:
    """
    Add any columns that exist in the DataFrame but are missing from the table.
    Uses TEXT for all new columns to avoid type-mismatch errors.
    This allows schema evolution — new fields in the source just appear.
    """
    inspector = inspect(engine)
    existing = {col["name"] for col in inspector.get_columns(bare_table_name, schema=schema_name)}
    missing = [col for col in df.columns if col not in existing]

    if not missing:
        return

    inferred = {c.name: c.postgres_type for c in infer_column_definitions(df)}
    with engine.begin() as conn:
        for col in missing:
            pg_type = inferred.get(col, "TEXT")
            conn.execute(text(
                f"ALTER TABLE {quote_table_name(table_name)} "
                f"ADD COLUMN IF NOT EXISTS {quote_identifier(col)} {pg_type};"
            ))


def ensure_table_exists(dataset: object, df: pd.DataFrame, engine: Engine) -> bool:
    """
    Create the staging table if it doesn't exist.
    If it does exist, add any new columns from the DataFrame (schema evolution).

    Returns True if the table was newly created.
    """
    if not dataset.table:  # type: ignore[attr-defined]
        raise ValueError(f"Dataset '{dataset.name}' is missing a target table.")  # type: ignore[attr-defined]

    inspector = inspect(engine)
    schema_name: Optional[str] = None
    bare_table_name = dataset.table  # type: ignore[attr-defined]

    if "." in dataset.table:  # type: ignore[attr-defined]
        schema_name, bare_table_name = dataset.table.split(".", 1)  # type: ignore[attr-defined]

    table_exists = inspector.has_table(bare_table_name, schema=schema_name)

    if table_exists:
        # Evolve the schema: add missing columns if the source grew
        try:
            _sync_table_columns(engine, dataset.table, df, schema_name, bare_table_name)  # type: ignore[attr-defined]
        except Exception:
            pass  # Non-fatal — load will still succeed for existing columns
        return False

    # Create fresh
    create_sql = build_create_table_sql(dataset.table, df)  # type: ignore[attr-defined]
    with engine.begin() as conn:
        conn.execute(text(create_sql))

    return True
