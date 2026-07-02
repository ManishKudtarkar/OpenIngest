from pathlib import Path
import pandas as pd

from models.dataset import Dataset
from utils.config_loader import load_dataset_config

RAW_FOLDER = Path("data/raw")


def discover_datasets():

    config = load_dataset_config()
    configured = config["datasets"]

    discovered = []

    for csv in RAW_FOLDER.glob("*.csv"):

        df = pd.read_csv(csv, nrows=5)

        with open(csv, "r", encoding="utf-8") as f:
            row_count = sum(1 for _ in f) - 1

        dataset = Dataset(
            name=csv.stem,
            file=csv,
            registered=False,
            table=None,
            config=None,
            rows=row_count,
            columns=list(df.columns),
            column_count=len(df.columns),
            file_size_bytes=csv.stat().st_size,
        )

        for dataset_name, values in configured.items():

            if values["file"] == csv.name:

                dataset.registered = True
                dataset.name = dataset_name
                dataset.table = values["staging_table"]
                dataset.config = values
                break

        discovered.append(dataset)

    return discovered