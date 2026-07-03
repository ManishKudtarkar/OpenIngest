import pandas as pd

from utils.metadata_logger import ensure_metadata_schema
from utils.db import get_engine


def pipeline_report():

    engine = get_engine()
    ensure_metadata_schema(engine)

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
            d.dataset_name,
            d.rows_loaded,
            d.duration_seconds,
            d.status,
            COALESCE(d.load_strategy, 'replace') AS load_strategy,
            COALESCE(d.load_mode, 'FULL') AS load_mode,
            COALESCE(d.incremental_column, '') AS incremental_column,
            COALESCE(d.watermark_value, '') AS watermark_value,
            COALESCE(d.auto_created_table, FALSE) AS auto_created_table,
            COALESCE(q.status, 'NOT RUN') AS quality_status,
            COALESCE(q.score, 0) AS quality_score
        FROM pipeline_dataset_runs d
        LEFT JOIN pipeline_quality_runs q
            ON q.run_id = d.run_id
            AND q.dataset_name = d.dataset_name
        WHERE d.run_id='{run.run_id}'
        ORDER BY d.dataset_name;
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
            f"   Load: {row.load_strategy}/{row.load_mode}"
            f"   Watermark: {row.incremental_column or '-'}={row.watermark_value or '-'}"
            f"   Auto-created table: {'YES' if row.auto_created_table else 'NO'}"
            f"   Quality: {row.quality_status} ({row.quality_score:.2f}%)"
        )

    print("=" * 80)