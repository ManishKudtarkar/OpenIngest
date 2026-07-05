from pathlib import Path

import yaml


def run_graph() -> int:
    config_path = Path("configs/datasets.yaml")
    if not config_path.exists():
        print("  configs/datasets.yaml not found.")
        return 1

    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f) or {}

    datasets = config.get("datasets") or {}
    if not datasets:
        print("  No datasets registered.")
        return 0

    print("\n== OpenIngest Pipeline Graph ===================================\n")
    print("  [START]")
    print("     |")

    names = list(datasets.keys())

    # Show parallel fan-out
    branches = []
    for name in names:
        ds = datasets[name]
        strategy = ds.get("load_strategy", "replace")
        table = ds.get("staging_table", f"stg_{name}")
        branches.append((name, strategy, table))

    # Print each branch
    for i, (name, strategy, table) in enumerate(branches):
        connector = "|" if i < len(branches) - 1 else "|"
        print(f"     {connector}-- [{name}]")
        print(f"     |     discover -> validate -> quality -> ingest ({strategy})")
        print(f"     |     -> {table}")
        if i < len(branches) - 1:
            print("     |")

    print("     |")
    print("     +-- [pipeline_report]")
    print("     |")
    print("  [END]\n")

    # Strategy summary
    strategies: dict[str, int] = {}
    for _, strategy, _ in branches:
        strategies[strategy] = strategies.get(strategy, 0) + 1

    print("  Strategy breakdown:")
    for s, count in sorted(strategies.items()):
        print(f"    {s:<15} {count} dataset(s)")

    print(f"\n  Total datasets : {len(branches)}")
    print(f"  Tasks per DAG  : {len(branches) * 4 + 3}  (4 per dataset + start/report/end)\n")
    return 0
