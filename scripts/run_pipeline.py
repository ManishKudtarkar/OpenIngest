from datetime import datetime

from scripts.discover_datasets import discover_datasets
from scripts.ingest_dataset import ingest_dataset
from utils.schema_utils import compare_schema


def run_pipeline():

    datasets = discover_datasets()

    pipeline_start = datetime.now()

    print()
    print("=" * 80)
    print("OPENINGEST PIPELINE")
    print("=" * 80)

    total_rows = 0
    processed = 0
    skipped = 0

    for dataset in datasets:

        print()
        print("=" * 80)
        print(dataset.name.upper())
        print("=" * 80)

        if not dataset.registered:
            print("Status : NOT REGISTERED")
            skipped += 1
            continue

        result = compare_schema(
            dataset.columns,
            dataset.config["required_columns"]
        )

        dataset.schema_valid = result["valid"]

        if not dataset.schema_valid:

            print("Schema validation failed.")

            if result["missing"]:
                print("Missing Columns:")
                for col in result["missing"]:
                    print(f"  - {col}")

            skipped += 1
            continue

        dataset = ingest_dataset(dataset)

        processed += 1
        total_rows += dataset.rows_loaded

    pipeline_end = datetime.now()

    duration = round(
        (pipeline_end - pipeline_start).total_seconds(),
        2
    )

    print()
    print("=" * 80)
    print("PIPELINE SUMMARY")
    print("=" * 80)
    print(f"Datasets Found    : {len(datasets)}")
    print(f"Processed         : {processed}")
    print(f"Skipped           : {skipped}")
    print(f"Rows Loaded       : {total_rows:,}")
    print(f"Pipeline Duration : {duration} sec")
    print("=" * 80)


if __name__ == "__main__":
    run_pipeline()