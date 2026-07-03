from core.discovery import discover_datasets
from core.ingestion import ingest_dataset
from core.quality import run_quality_checks
from core.validation import validate_dataset

from utils.metadata_logger import MetadataLogger


def run_pipeline():

    logger = MetadataLogger()

    run = logger.create_pipeline_run()

    print("=" * 80)
    print("OPENINGEST")
    print("=" * 80)
    print(f"Run ID : {run.run_id}")
    print("=" * 80)

    datasets = discover_datasets()

    run.datasets = datasets

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

        validation = validate_dataset(dataset)

        if not validation["valid"]:

            print("Schema Validation Failed")

            skipped += 1

            continue

        quality_result = run_quality_checks(dataset)

        logger.log_quality_result(run.run_id, dataset, quality_result)

        print(
            f"Quality Check : {quality_result['status']} "
            f"({quality_result['score']:.2f}%)"
        )

        if not quality_result["passed"]:

            print("Data Quality Failed")

            skipped += 1

            continue

        dataset = ingest_dataset(dataset)

        processed += 1

        run.total_rows += dataset.rows_loaded

        logger.log_dataset(run, dataset)

    run.status = "SUCCESS"

    logger.finish_pipeline(run)

    print()
    print("=" * 80)
    print("PIPELINE SUMMARY")
    print("=" * 80)

    print(f"Run ID            : {run.run_id}")
    print(f"Datasets Found    : {len(run.datasets)}")
    print(f"Processed         : {processed}")
    print(f"Skipped           : {skipped}")
    print(f"Rows Loaded       : {run.total_rows:,}")
    print(f"Duration          : {run.total_duration} sec")
    print(f"Status            : {run.status}")

    print("=" * 80)