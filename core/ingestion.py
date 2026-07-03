import time
from datetime import datetime

import pandas as pd
from sqlalchemy import text

from core.schema import ensure_table_exists, quote_table_name
from core.incremental import load_incremental_dataset
from core.validation import validate_dataset
from models.dataset import Dataset
from utils.db import get_engine


class DatasetIngestionError(Exception):
    """
    Raised whenever a dataset cannot be ingested.
    """
    pass


def ingest_dataset(dataset: Dataset) -> Dataset:
    """
    Ingest a single dataset into PostgreSQL.

    Workflow
    --------
    1. Check registration
    2. Validate schema
    3. Read CSV
    4. Load into PostgreSQL
    5. Update metadata
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
    # Read CSV
    # --------------------------------------------------

    df = pd.read_csv(dataset.file)

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
        dataset.rows_loaded = int(load_result["rows_loaded"])
        dataset.load_mode = str(load_result["load_mode"])
        dataset.watermark_value = load_result.get("watermark_value")
    elif strategy.lower() == "replace":
        with engine.begin() as conn:
            conn.execute(text(f"TRUNCATE TABLE {quote_table_name(dataset.table or dataset.name)};"))

        df.to_sql(
            dataset.table,
            engine,
            if_exists="append",
            index=False,
            method="multi",
        )

        dataset.load_mode = "FULL"
        dataset.rows_loaded = len(df)
        dataset.watermark_value = None
    else:
        df.to_sql(
            dataset.table,
            engine,
            if_exists="append",
            index=False,
            method="multi",
        )

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