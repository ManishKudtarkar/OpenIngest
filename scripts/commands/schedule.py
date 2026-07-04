from pathlib import Path


PRESETS = {
    "hourly":  "0 * * * *",
    "daily":   "0 0 * * *",
    "weekly":  "0 0 * * 0",
    "monthly": "0 0 1 * *",
}

AIRFLOW_PRESETS = {
    "hourly":  "@hourly",
    "daily":   "@daily",
    "weekly":  "@weekly",
    "monthly": "@monthly",
}


def run_schedule(schedule_arg: str) -> int:
    cron = PRESETS.get(schedule_arg.lower(), schedule_arg)
    airflow_schedule = AIRFLOW_PRESETS.get(schedule_arg.lower(), schedule_arg)

    # Validate cron expression (basic check)
    parts = cron.split()
    if not cron.startswith("@") and len(parts) != 5:
        print(f"  Invalid schedule: '{schedule_arg}'")
        print("  Use a preset: hourly, daily, weekly, monthly")
        print("  Or a cron expression: \"0 6 * * *\"")
        return 1

    # Write to pipeline.yaml
    pipeline_path = Path("configs/pipeline.yaml")
    schedule_config = {"schedule": airflow_schedule, "cron": cron}

    import yaml
    if pipeline_path.exists():
        with open(pipeline_path, "r", encoding="utf-8") as f:
            existing = yaml.safe_load(f) or {}
    else:
        existing = {}

    existing.update(schedule_config)

    with open(pipeline_path, "w", encoding="utf-8") as f:
        yaml.dump(existing, f, default_flow_style=False)

    print(f"\n  Schedule set: {airflow_schedule}  (cron: {cron})")
    print(f"  Written to  : {pipeline_path}")

    # Patch the DAG file if it exists
    dag_path = Path("dags/openingest_dynamic_dag.py")
    if dag_path.exists():
        content = dag_path.read_text(encoding="utf-8")
        import re
        patched = re.sub(
            r'schedule\s*=\s*["\'][^"\']*["\']',
            f'schedule="{airflow_schedule}"',
            content,
        )
        if patched != content:
            dag_path.write_text(patched, encoding="utf-8")
            print(f"  Updated     : {dag_path}  schedule=\"{airflow_schedule}\"")

    print()
    return 0
