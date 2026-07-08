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
from scripts.commands.init import run_init
from scripts.commands.add_dataset import run_add_dataset
from scripts.commands.doctor import run_doctor
from scripts.commands.discover import run_discover
from scripts.commands.profile import run_profile
from scripts.commands.infer import run_infer
from scripts.commands.version import run_version, run_upgrade
from scripts.commands.graph import run_graph
from scripts.commands.docker_cmd import run_docker_init
from scripts.commands.airflow_cmd import run_airflow_build
from scripts.commands.schedule import run_schedule
from scripts.dashboard import show_dashboard
from scripts.data_quality_checks import run_data_quality_checks
import pandas as pd
from utils.db import get_engine
from utils.config_loader import load_pipeline_config
from utils.project import chdir_project_root

PROJECT_COMMANDS = {
    "run",
    "validate",
    "quality",
    "report",
    "dashboard",
    "add-dataset",
    "discover",
    "profile",
    "infer",
    "graph",
    "schedule",
    "scheduler",
    "docker",
    "airflow",
    "history",
}


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
    engine = get_engine()

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
    subparsers.add_parser("doctor", help="Check environment and connectivity")
    add_dataset_parser = subparsers.add_parser("add-dataset", help="Register a new dataset")
    add_dataset_parser.add_argument(
        "file",
        nargs="?",
        help="Optional CSV filename or path to prefill dataset registration",
    )
    subparsers.add_parser("discover", help="Scan data/raw/ and register unregistered CSVs")
    subparsers.add_parser("version", help="Show OpenIngest version")
    subparsers.add_parser("upgrade", help="Upgrade OpenIngest to the latest version")
    subparsers.add_parser("graph", help="Visualize the pipeline as ASCII graph")

    profile_parser = subparsers.add_parser("profile", help="Profile a CSV file")
    profile_parser.add_argument("file", help="CSV filename or path")

    infer_parser = subparsers.add_parser("infer", help="Infer datasets.yaml config from a CSV")
    infer_parser.add_argument("file", help="CSV filename or path")

    schedule_parser = subparsers.add_parser("schedule", help="Set pipeline schedule (daily, hourly, cron)")
    schedule_parser.add_argument("schedule", help="Preset (daily/hourly/weekly/monthly) or cron expression")

    scheduler_parser = subparsers.add_parser("scheduler", help="Built-in scheduler (no Airflow required)")
    scheduler_sub = scheduler_parser.add_subparsers(dest="scheduler_command", required=True)
    sched_start = scheduler_sub.add_parser("start", help="Start the built-in cron scheduler")
    sched_start.add_argument(
        "--cron",
        metavar="EXPR",
        help='Cron expression or preset (@daily, @hourly, "0 * * * *"). '
             "Defaults to schedule in configs/pipeline.yaml.",
    )
    sched_start.add_argument(
        "--dry-run",
        action="store_true",
        help="Run in dry-run mode (no DB writes) on each scheduled tick.",
    )

    docker_parser = subparsers.add_parser("docker", help="Docker subcommands")
    docker_sub = docker_parser.add_subparsers(dest="docker_command", required=True)
    docker_sub.add_parser("init", help="Generate docker-compose.yml")

    airflow_parser = subparsers.add_parser("airflow", help="Airflow subcommands")
    airflow_sub = airflow_parser.add_subparsers(dest="airflow_command", required=True)
    airflow_sub.add_parser("build", help="Generate Airflow DAG from datasets.yaml")

    init_parser = subparsers.add_parser("init", help="Scaffold a new OpenIngest project")
    init_parser.add_argument("project_name", help="Name of the project directory to create")

    history_parser = subparsers.add_parser("history", help="Show pipeline and dataset history")
    history_parser.add_argument("--limit", type=int, default=20, help="Number of recent pipeline runs")

    args = parser.parse_args()

    if args.command in PROJECT_COMMANDS:
        try:
            root = chdir_project_root()
            print(f"OpenIngest project: {root}")
        except RuntimeError as exc:
            print(f"Error: {exc}")
            return 1

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

    if args.command == "doctor":
        return run_doctor()

    if args.command == "add-dataset":
        return run_add_dataset(args.file)

    if args.command == "init":
        return run_init(args.project_name)

    if args.command == "discover":
        return run_discover()

    if args.command == "profile":
        return run_profile(args.file)

    if args.command == "infer":
        return run_infer(args.file)

    if args.command == "version":
        return run_version()

    if args.command == "upgrade":
        return run_upgrade()

    if args.command == "graph":
        return run_graph()

    if args.command == "schedule":
        return run_schedule(args.schedule)

    if args.command == "scheduler":
        if args.scheduler_command == "start":
            from core.scheduler import Scheduler
            cron_arg = args.cron or None
            if not cron_arg:
                cfg = load_pipeline_config()
                cron_arg = cfg.get("cron") or cfg.get("schedule") or "@daily"
            dry = getattr(args, "dry_run", False)
            s = Scheduler(cron_expression=cron_arg, dry_run=dry)
            s.start()
            return 0

    if args.command == "docker":
        if args.docker_command == "init":
            return run_docker_init()

    if args.command == "airflow":
        if args.airflow_command == "build":
            return run_airflow_build()

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
