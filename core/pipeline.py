from core.discovery import discover_datasets
from core.ingestion import ingest_dataset, _read_dataset
from core.quality import run_quality_checks
from core.validation import validate_dataset

from utils.metadata_logger import MetadataLogger


def run_pipeline(dry_run: bool = False, dataset_filter: str | None = None):

    logger = MetadataLogger()

    run = logger.create_pipeline_run()

    print("=" * 80)
    print("OPENINGEST")
    print("=" * 80)
    print(f"Run ID : {run.run_id}")
    print("=" * 80)

    datasets = discover_datasets()

    if dataset_filter:
        datasets = [d for d in datasets if d.name == dataset_filter]
        if not datasets:
            print(f"Error: dataset '{dataset_filter}' not found.")
            return

    if dry_run:
        print("[DRY RUN] Validation only — no data will be loaded.")

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
            # For remote sources with deferred schema discovery (REST/API),
            # empty columns means we couldn't sample — skip validation, proceed.
            source_type = (dataset.config or {}).get("source", {}).get("type", "").lower()
            if source_type in ("rest", "api") and not dataset.columns:
                print("Schema Validation : DEFERRED (remote source — checked at ingest)")
            else:
                print("Schema Validation Failed")
                skipped += 1
                continue

        # ── Read data ONCE — reuse for quality check and ingest ──────────────
        try:
            df = _read_dataset(dataset)
        except Exception as exc:
            print(f"Failed to read dataset '{dataset.name}': {exc}")
            skipped += 1
            continue

        # Update columns now that we have the real data
        dataset.columns = list(df.columns)
        dataset.rows = len(df)

        # Re-validate with real columns if we deferred earlier
        if not validation["valid"]:
            validation = validate_dataset(dataset)
            if not validation["valid"]:
                print("Schema Validation Failed (post-read)")
                skipped += 1
                continue

        quality_result = run_quality_checks(dataset, df=df)

        logger.log_quality_result(run.run_id, dataset, quality_result)

        print(
            f"Quality Check : {quality_result['status']} "
            f"({quality_result['score']:.2f}%)"
        )

        if not quality_result["passed"]:
            print("Data Quality Failed")
            skipped += 1
            continue

        if dry_run:
            print(f"  [DRY RUN] {dataset.name} — would ingest (skipping)")
            processed += 1
            continue

        dataset = ingest_dataset(dataset, df=df)

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