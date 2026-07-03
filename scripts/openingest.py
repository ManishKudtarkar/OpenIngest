import argparse
import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from core.discovery import discover_datasets
from core.pipeline import run_pipeline
from core.reporting import pipeline_report
from core.validation import validate_dataset
from scripts.dashboard import show_dashboard
from scripts.data_quality_checks import run_data_quality_checks
import pandas as pd
from utils.db import get_engine


engine = get_engine()


def run_validate() -> int:
    datasets = discover_datasets()

    print("=" * 80)
    print("OPENINGEST VALIDATION")
    print("=" * 80)

    failures = 0

    for dataset in datasets:
        if not dataset.registered:
            continue

        result = validate_dataset(dataset)
        status = "PASS" if result["valid"] else "FAIL"

        print(
            f"{dataset.name:<15}"
            f"{status:<8}"
            f"missing={len(result['missing'])}"
            f"  extra={len(result['extra'])}"
        )

        if not result["valid"]:
            failures += 1

    print("=" * 80)

    if failures:
        print(f"Validation failed for {failures} dataset(s).")
        return 1

    print("All schema validations passed.")
    return 0


def run_history(limit: int) -> None:
    print("\n" + "=" * 80)
    print("PIPELINE RUN HISTORY")
    print("=" * 80)

    runs = pd.read_sql(
        f"SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT {int(limit)};",
        engine,
    )
    print(runs.to_string(index=False) if not runs.empty else "No pipeline runs found.")

    print("\n" + "=" * 80)
    print("DATASET RUN HISTORY")
    print("=" * 80)

    datasets = pd.read_sql(
        f"""
        SELECT *
        FROM pipeline_dataset_runs
        ORDER BY loaded_at DESC
        LIMIT {int(limit) * 10};
        """,
        engine,
    )
    print(datasets.to_string(index=False) if not datasets.empty else "No dataset history found.")


def main() -> int:
    parser = argparse.ArgumentParser(
        prog="openingest",
        description="OpenIngest command-line interface",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    run_parser = subparsers.add_parser("run", help="Run full ingestion pipeline")
    run_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and check quality without loading data",
    )
    run_parser.add_argument(
        "--dataset",
        metavar="NAME",
        help="Run pipeline for a single dataset only",
    )

    subparsers.add_parser("validate", help="Validate schemas for all registered datasets")
    subparsers.add_parser("quality", help="Run quality checks for all registered datasets")
    subparsers.add_parser("report", help="Show latest pipeline execution report")
    subparsers.add_parser("dashboard", help="Show monitoring dashboard")

    history_parser = subparsers.add_parser("history", help="Show pipeline and dataset history")
    history_parser.add_argument("--limit", type=int, default=20, help="Number of recent pipeline runs")

    args = parser.parse_args()

    if args.command == "run":
        run_pipeline(dry_run=args.dry_run, dataset_filter=args.dataset)
        return 0

    if args.command == "validate":
        return run_validate()

    if args.command == "quality":
        run_data_quality_checks()
        return 0

    if args.command == "report":
        pipeline_report()
        return 0

    if args.command == "dashboard":
        show_dashboard()
        return 0

    if args.command == "history":
        run_history(limit=args.limit)
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
