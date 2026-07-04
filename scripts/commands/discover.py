from pathlib import Path

import yaml


def run_discover() -> int:
    raw_dir = Path("data/raw")
    config_path = Path("configs/datasets.yaml")

    if not raw_dir.exists():
        print("  data/raw/ directory not found. Run: openingest init <project>")
        return 1

    csvs = sorted(raw_dir.glob("*.csv"))
    if not csvs:
        print("  No CSV files found in data/raw/")
        return 0

    # Load existing config to find already-registered files
    registered_files: set[str] = set()
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            existing = yaml.safe_load(f) or {}
        for ds in (existing.get("datasets") or {}).values():
            registered_files.add(ds.get("file", ""))

    new_csvs = [c for c in csvs if c.name not in registered_files]

    print("\n== OpenIngest Discover =========================================\n")
    print(f"  Found {len(csvs)} CSV file(s) in data/raw/\n")

    for csv in csvs:
        status = "registered" if csv.name in registered_files else "unregistered"
        print(f"  {csv.name:<35} [{status}]")

    if not new_csvs:
        print("\n  All CSV files are already registered.\n")
        return 0

    print(f"\n  {len(new_csvs)} unregistered file(s):\n")
    for csv in new_csvs:
        print(f"    {csv.name}")

    print()
    answer = input("  Register all unregistered datasets? (Y/N): ").strip().lower()

    if answer != "y":
        print("  Skipped. Run: openingest add-dataset to register individually.\n")
        return 0

    # Load or init config
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f) or {}
    else:
        config = {}

    if "datasets" not in config or config["datasets"] is None:
        config["datasets"] = {}

    added = 0
    for csv in new_csvs:
        name = csv.stem
        table = f"stg_{name}"

        config["datasets"][name] = {
            "file": csv.name,
            "staging_table": table,
            "load_strategy": "replace",
        }

        print(f"  + Registered: {name} -> {table}")
        added += 1

    with open(config_path, "w", encoding="utf-8") as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False)

    print(f"\n  {added} dataset(s) registered in configs/datasets.yaml")
    print("  Run: openingest profile <file> to inspect a dataset")
    print("  Run: openingest infer <file>   to generate full config\n")
    return 0
