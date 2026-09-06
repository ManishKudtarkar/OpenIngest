from __future__ import annotations

from core.discovery import discover_datasets
from core.ingestion import _read_dataset, ingest_dataset
from core.lineage import LineageGraph
from core.notifications import NotificationManager
from core.quality import run_quality_checks
from core.transform import TransformEngine, TransformError
from core.validation import validate_dataset
from utils.config_loader import load_pipeline_config
from utils.metadata_logger import MetadataLogger


def run_pipeline(dry_run: bool = False, dataset_filter: str | None = None) -> None:

    logger = MetadataLogger()
    run = logger.create_pipeline_run()

    # Load pipeline config for notifications
    pipeline_cfg = load_pipeline_config()
    notifications_cfg = pipeline_cfg.get("notifications", {})
    notifier = NotificationManager(notifications_cfg) if notifications_cfg else None

    # Lineage graph — tracks data flow for this run
    lineage = LineageGraph()

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
        except Exception as exc:  # noqa: BLE001
            print(f"Failed to read dataset '{dataset.name}': {exc}")
            lineage.add_dataset_lineage(dataset)
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
                lineage.add_dataset_lineage(dataset)
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
            lineage.add_dataset_lineage(dataset)
            skipped += 1
            continue

        # ── Transform stage ──────────────────────────────────────────────────
        engine = TransformEngine(dataset.config or {})
        if engine.has_transforms:
            rows_before = len(df)
            cols_before = len(df.columns)
            try:
                df = engine.run(df)
            except TransformError as exc:
                print(f"Transform Failed : {exc}")
                lineage.add_dataset_lineage(dataset)
                skipped += 1
                continue
            print(
                f"Transform      : {len(engine.steps)} step(s) applied  "
                f"({rows_before} → {len(df)} rows, "
                f"{cols_before} → {len(df.columns)} cols)"
            )
            dataset.columns = list(df.columns)
            dataset.rows = len(df)

        if dry_run:
            print(f"  [DRY RUN] {dataset.name} — would ingest (skipping)")
            lineage.add_dataset_lineage(dataset)
            processed += 1
            continue

        dataset = ingest_dataset(dataset, df=df)
        lineage.add_dataset_lineage(dataset)
        processed += 1
        run.total_rows += dataset.rows_loaded
        logger.log_dataset(run, dataset)

    # ── Determine final status ───────────────────────────────────────────────
    if skipped > 0 and processed == 0:
        run.status = "FAILED"
    elif skipped > 0:
        run.status = "PARTIAL"
    else:
        run.status = "SUCCESS"

    logger.finish_pipeline(run)

    # ── Send notifications ───────────────────────────────────────────────────
    if notifier:
        try:
            notifier.notify(run)
        except Exception as exc:  # noqa: BLE001
            print(f"Notification error (non-fatal): {exc}")

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
