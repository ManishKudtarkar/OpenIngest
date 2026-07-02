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

        # Read only the header + a few rows
        df = pd.read_csv(csv, nrows=5)

        # Count rows (excluding header)
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

        # Match against datasets.yaml
        for dataset_name, values in configured.items():

            if values["file"] == csv.name:

                dataset.registered = True
                dataset.name = dataset_name
                dataset.table = values["staging_table"]
                dataset.config = values

                break

        discovered.append(dataset)

    return discovered


if __name__ == "__main__":

    datasets = discover_datasets()

    print("=" * 80)
    print("OPENINGEST DATASET DISCOVERY")
    print("=" * 80)

    for ds in datasets:

        print(f"Dataset       : {ds.name}")
        print(f"Registered    : {ds.registered}")
        print(f"Rows          : {ds.rows:,}")
        print(f"Columns       : {ds.column_count}")
        print(f"Target Table  : {ds.table}")
        print(f"File Size     : {round(ds.file_size_bytes / 1024, 2)} KB")

        print("\nColumn List:")

        for column in ds.columns:
            print(f"   • {column}")

        print("-" * 80)