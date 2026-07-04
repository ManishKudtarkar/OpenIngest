from pathlib import Path

import yaml


# The DAG template is the live dags/openingest_dynamic_dag.py itself.
# airflow build copies it after patching the schedule from pipeline.yaml.
_DAG_SOURCE = Path("dags/openingest_dynamic_dag.py")


def run_airflow_build() -> int:
    config_path = Path("configs/datasets.yaml")
    if not config_path.exists():
        print("  configs/datasets.yaml not found.")
        return 1

    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f) or {}

    datasets = list((config.get("datasets") or {}).keys())
    if not datasets:
        print("  No datasets registered in configs/datasets.yaml.")
        return 1

    dag_dir = Path("dags")
    dag_dir.mkdir(exist_ok=True)
    dag_path = dag_dir / "openingest_dynamic_dag.py"

    # Read schedule from pipeline.yaml if available
    schedule = "@daily"
    pipeline_cfg = Path("configs/pipeline.yaml")
    if pipeline_cfg.exists():
        with open(pipeline_cfg, "r", encoding="utf-8") as f:
            pcfg = yaml.safe_load(f) or {}
        schedule = pcfg.get("schedule", "@daily")

    # Patch schedule in existing DAG source if present
    if _DAG_SOURCE.exists():
        import re
        content = _DAG_SOURCE.read_text(encoding="utf-8")
        content = re.sub(
            r'schedule\s*=\s*["\'][^"\']*["\']',
            f'schedule="{schedule}"',
            content,
        )
        dag_path.write_text(content, encoding="utf-8")
    else:
        print("  dags/openingest_dynamic_dag.py not found — nothing to build from.")
        return 1

    print(f"\n  Generated: {dag_path}")
    print(f"  Schedule : {schedule}")
    print(f"  Datasets : {len(datasets)}")
    for name in datasets:
        strategy = config["datasets"][name].get("load_strategy", "replace")
        print(f"    - {name:<20} ({strategy})")
    print("\n  Airflow will pick up the DAG within ~30 seconds.\n")
    return 0
