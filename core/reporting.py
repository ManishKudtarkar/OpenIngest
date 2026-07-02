import pandas as pd

from utils.db import get_engine


def pipeline_report():

    engine = get_engine()

    latest_run = pd.read_sql(
        """
        SELECT *
        FROM pipeline_runs
        ORDER BY started_at DESC
        LIMIT 1;
        """,
        engine,
    )

    if latest_run.empty:
        print("No pipeline runs found.")
        return

    run = latest_run.iloc[0]

    datasets = pd.read_sql(
        f"""
        SELECT
            dataset_name,
            rows_loaded,
            duration_seconds,
            status
        FROM pipeline_dataset_runs
        WHERE run_id='{run.run_id}'
        ORDER BY dataset_name;
        """,
        engine,
    )

    print()
    print("=" * 80)
    print("OPENINGEST EXECUTION REPORT")
    print("=" * 80)

    print(f"Run ID          : {run.run_id}")
    print(f"Started         : {run.started_at}")
    print(f"Finished        : {run.finished_at}")
    print(f"Status          : {run.status}")
    print(f"Rows Loaded     : {run.total_rows:,}")
    print(f"Duration        : {run.total_duration} sec")

    print()
    print("-" * 80)
    print("DATASETS")
    print("-" * 80)

    for _, row in datasets.iterrows():

        print(
            f"{row.dataset_name:<15}"
            f"{row.status:<12}"
            f"{row.rows_loaded:>8,} rows"
            f"   {row.duration_seconds:>6} sec"
        )

    print("=" * 80)