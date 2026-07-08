from pathlib import Path
from typing import Any

import yaml


CONFIG_PATH = Path("configs/datasets.yaml")


def _prompt(label: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    value = input(f"{label}{suffix}: ").strip()
    return value if value else default


def _prompt_list(label: str) -> list[str]:
    print(f"{label} (comma-separated):")
    raw = input("> ").strip()
    return [c.strip() for c in raw.split(",") if c.strip()]


def _prompt_strategy() -> str:
    print("\nLoad strategy:")
    print("  1  replace     - truncate and reload every run")
    print("  2  append      - insert new rows only")
    print("  3  incremental - watermark + change detection + upsert")
    choice = input("Choice [1]: ").strip() or "1"
    return {"1": "replace", "2": "append", "3": "incremental"}.get(choice, "replace")


def run_add_dataset(file_arg: str | None = None) -> int:
    print("\n== Add Dataset =========================================\n")

    file_path = Path(file_arg) if file_arg else None
    default_name = file_path.stem if file_path else ""
    default_file = file_path.name if file_path else ""

    name = _prompt("Dataset name (e.g. customers)", default_name)
    if not name:
        print("Error: dataset name is required.")
        return 1

    csv_file = _prompt("CSV filename (e.g. customers.csv)", default_file or f"{name}.csv")
    table = _prompt("Staging table", f"stg_{name}")
    strategy = _prompt_strategy()

    primary_key = _prompt_list("\nPrimary key column(s)")
    required_columns = _prompt_list("Required columns")
    non_null_columns = _prompt_list("Non-null columns (leave blank to skip)")
    unique_columns = _prompt_list("Unique columns (leave blank to skip)")

    incremental_column: str | None = None
    hash_columns: list[str] = []

    if strategy == "incremental":
        incremental_column = _prompt("\nWatermark column (e.g. updated_at)")
        hash_columns = _prompt_list("Hash columns for change detection")

    entry: dict[str, Any] = {
        "file": csv_file,
        "staging_table": table,
        "load_strategy": strategy,
    }

    if primary_key:
        entry["primary_key"] = primary_key
    if required_columns:
        entry["required_columns"] = required_columns
    if non_null_columns:
        entry["non_null_columns"] = non_null_columns
    if unique_columns:
        entry["unique_columns"] = unique_columns
    if incremental_column:
        entry["incremental_column"] = incremental_column
    if hash_columns:
        entry["hash_columns"] = hash_columns

    if not CONFIG_PATH.exists():
        CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
        config: dict[str, Any] = {"datasets": {}}
    else:
        with open(CONFIG_PATH) as f:
            config = yaml.safe_load(f) or {}
        if "datasets" not in config:
            config["datasets"] = {}

    if name in config["datasets"]:
        overwrite = input(f"\n'{name}' already exists. Overwrite? (y/N): ").strip().lower()
        if overwrite != "y":
            print("Cancelled.")
            return 0

    config["datasets"][name] = entry

    with open(CONFIG_PATH, "w") as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

    print(f"\n  '{name}' registered in {CONFIG_PATH}")
    print(f"\nNext: openingest run --dataset {name}")
    print()

    return 0
