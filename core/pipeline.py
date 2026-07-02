from datetime import datetime

from core.discovery import discover_datasets
from core.validation import validate_dataset
from core.ingestion import ingest_dataset
from core.metadata import generate_run_id


def run_pipeline():

    run_id = generate_run_id()

    pipeline_start = datetime.now()

    datasets = discover_datasets()

    processed = 0
    skipped = 0
    total_rows = 0

    print("=" * 80)
    print("OPENINGEST")
    print("=" * 80)

    print(f"Run ID : {run_id}")

    print()

    for dataset in datasets:

        print("=" * 80)

        print(dataset.name.upper())

        print("=" * 80)

        if not dataset.registered:

            print("Status : NOT REGISTERED")

            skipped += 1

            continue

        result = validate_dataset(dataset)

        if not result["valid"]:

            print("Schema Validation Failed")

            skipped += 1

            continue

        dataset = ingest_dataset(dataset)

        processed += 1

        total_rows += dataset.rows_loaded

        print(
            f"SUCCESS ({dataset.rows_loaded:,} rows)"
        )

        print()

    pipeline_end = datetime.now()

    duration = (
        pipeline_end - pipeline_start
    ).total_seconds()

    print("=" * 80)

    print("PIPELINE SUMMARY")

    print("=" * 80)

    print(f"Run ID      : {run_id}")

    print(f"Datasets    : {len(datasets)}")

    print(f"Processed   : {processed}")

    print(f"Skipped     : {skipped}")

    print(f"Rows Loaded : {total_rows:,}")

    print(f"Duration    : {round(duration,2)} sec")

    print("=" * 80)