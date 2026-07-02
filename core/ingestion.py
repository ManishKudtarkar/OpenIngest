import time
from datetime import datetime

import pandas as pd

from models.dataset import Dataset
from utils.db import get_engine


class DatasetIngestionError(Exception):
    pass


def ingest_dataset(dataset: Dataset):

    if not dataset.registered:
        raise DatasetIngestionError(
            f"{dataset.name} not registered."
        )

    if not dataset.schema_valid:
        raise DatasetIngestionError(
            f"{dataset.name} schema invalid."
        )

    dataset.started_at = datetime.now()

    start = time.time()

    df = pd.read_csv(dataset.file)

    engine = get_engine()

    strategy = dataset.config.get(
        "load_strategy",
        "replace",
    )

    if_exists = "replace"

    if strategy == "append":
        if_exists = "append"

    df.to_sql(
        dataset.table,
        engine,
        if_exists=if_exists,
        index=False,
        method="multi",
    )

    dataset.finished_at = datetime.now()

    dataset.rows_loaded = len(df)

    dataset.duration_seconds = round(
        time.time() - start,
        2,
    )

    dataset.load_status = "SUCCESS"

    return dataset