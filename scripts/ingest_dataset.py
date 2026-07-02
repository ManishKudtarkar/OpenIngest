import time
from datetime import datetime

import pandas as pd

from models.dataset import Dataset
from utils.db import get_engine


class DatasetIngestionError(Exception):
    """Raised when dataset ingestion fails."""
    pass


def ingest_dataset(dataset: Dataset) -> Dataset:
    """
    Generic ingestion engine.

    Reads a CSV file and loads it into the configured staging table.
    Updates the Dataset object with execution metadata.
    """

    # Ensure dataset is registered
    if not dataset.registered:
        raise DatasetIngestionError(
            f"Dataset '{dataset.name}' is not registered."
        )

    # Ensure schema validation passed
    if not dataset.schema_valid:
        raise DatasetIngestionError(
            f"Schema validation failed for '{dataset.name}'."
        )

    print("=" * 80)
    print(f"OPENINGEST :: INGESTING {dataset.name.upper()}")
    print("=" * 80)

    dataset.started_at = datetime.now()

    start = time.time()

    try:
        # Read CSV
        df = pd.read_csv(dataset.file)

        # Connect to database
        engine = get_engine()

        # Determine load strategy
        strategy = dataset.config.get("load_strategy", "replace")

        if strategy == "replace":
            if_exists = "replace"

        elif strategy == "append":
            if_exists = "append"

        else:
            raise DatasetIngestionError(
                f"Unknown load strategy: {strategy}"
            )

        # Load dataframe into PostgreSQL
        df.to_sql(
            name=dataset.table,
            con=engine,
            if_exists=if_exists,
            index=False,
            method="multi",
        )

        duration = round(time.time() - start, 2)

        dataset.finished_at = datetime.now()
        dataset.duration_seconds = duration
        dataset.rows_loaded = len(df)
        dataset.load_status = "SUCCESS"

        print(f"Rows Loaded : {dataset.rows_loaded:,}")
        print(f"Target Table: {dataset.table}")
        print(f"Strategy    : {strategy}")
        print(f"Duration    : {dataset.duration_seconds} sec")
        print("Status      : SUCCESS")

    except Exception as e:

        duration = round(time.time() - start, 2)

        dataset.finished_at = datetime.now()
        dataset.duration_seconds = duration
        dataset.rows_loaded = 0
        dataset.load_status = "FAILED"

        print("Status : FAILED")
        print(e)

        raise

    return dataset