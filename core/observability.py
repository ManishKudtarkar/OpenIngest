from __future__ import annotations

import pandas as pd

from utils.db import get_engine
from utils.metadata_logger import ensure_metadata_schema


def get_dashboard_kpis() -> dict:
    engine = get_engine()
    ensure_metadata_schema(engine)

    latest_run = pd.read_sql(
        """
        SELECT
            run_id,
            status,
            total_datasets,
            total_rows,
            total_duration
        FROM pipeline_runs
        ORDER BY started_at DESC
        LIMIT 1;
        """,
        engine,
    )

    if latest_run.empty:
        return {
            "datasets": 0,
            "pipeline_success_pct": 0.0,
            "rows_processed": 0,
            "quality_score": 0.0,
            "average_duration_seconds": 0.0,
        }

    run = latest_run.iloc[0]

    quality = pd.read_sql(
        f"""
        SELECT
            COALESCE(AVG(score) FILTER (WHERE score IS NOT NULL AND score > 0), 0) AS avg_quality_score
        FROM pipeline_quality_runs
        WHERE run_id = '{run.run_id}';
        """,
        engine,
    )

    quality_score = float(quality.iloc[0].avg_quality_score) if not quality.empty else 0.0

    return {
        "datasets": int(run.total_datasets),
        "pipeline_success_pct": 100.0 if str(run.status).upper() == "SUCCESS" else 0.0,
        "rows_processed": int(run.total_rows),
        "quality_score": quality_score,
        "average_duration_seconds": float(run.total_duration),
    }


def get_recent_pipeline_runs(limit: int = 10) -> pd.DataFrame:
    engine = get_engine()
    ensure_metadata_schema(engine)

    return pd.read_sql(
        f"""
        SELECT
            run_id,
            started_at,
            finished_at,
            status,
            total_datasets,
            total_rows,
            total_duration
        FROM pipeline_runs
        ORDER BY started_at DESC
        LIMIT {int(limit)};
        """,
        engine,
    )


def get_latest_dataset_health() -> pd.DataFrame:
    engine = get_engine()
    ensure_metadata_schema(engine)

    return pd.read_sql(
        """
        WITH latest_run AS (
            SELECT run_id
            FROM pipeline_runs
            ORDER BY started_at DESC
            LIMIT 1
        )
        SELECT
            d.dataset_name,
            d.status,
            d.rows_loaded,
            d.duration_seconds,
            COALESCE(d.load_strategy, 'replace') AS load_strategy,
            COALESCE(d.load_mode, 'FULL') AS load_mode,
            COALESCE(d.watermark_value, '-') AS watermark_value,
            COALESCE(q.status, 'NOT RUN') AS quality_status,
            COALESCE(q.score, 0) AS quality_score
        FROM pipeline_dataset_runs d
        LEFT JOIN pipeline_quality_runs q
            ON q.run_id = d.run_id
            AND q.dataset_name = d.dataset_name
        WHERE d.run_id = (SELECT run_id FROM latest_run)
        ORDER BY d.dataset_name;
        """,
        engine,
    )


def get_dataset_health_trends(limit_runs: int = 20) -> pd.DataFrame:
    engine = get_engine()
    ensure_metadata_schema(engine)

    return pd.read_sql(
        f"""
        WITH recent_runs AS (
            SELECT run_id
            FROM pipeline_runs
            ORDER BY started_at DESC
            LIMIT {int(limit_runs)}
        )
        SELECT
            d.dataset_name,
            COUNT(*) AS observations,
            ROUND(AVG(d.rows_loaded)::numeric, 2) AS avg_rows_loaded,
            ROUND(AVG(d.duration_seconds)::numeric, 2) AS avg_duration_seconds,
            ROUND((AVG(CASE WHEN d.status = 'SUCCESS' THEN 1 ELSE 0 END) * 100)::numeric, 2) AS success_rate_pct,
            ROUND(
                COALESCE(
                    AVG(q.score) FILTER (WHERE q.score IS NOT NULL AND q.score > 0),
                    0
                )::numeric,
                2
            ) AS avg_quality_score
        FROM pipeline_dataset_runs d
        LEFT JOIN pipeline_quality_runs q
            ON q.run_id = d.run_id
            AND q.dataset_name = d.dataset_name
        WHERE d.run_id IN (SELECT run_id FROM recent_runs)
        GROUP BY d.dataset_name
        ORDER BY d.dataset_name;
        """,
        engine,
    )


def get_dataset_current_vs_previous() -> pd.DataFrame:
    engine = get_engine()
    ensure_metadata_schema(engine)

    return pd.read_sql(
        """
        WITH recent_runs AS (
            SELECT
                run_id,
                ROW_NUMBER() OVER (ORDER BY started_at DESC) AS run_rank
            FROM pipeline_runs
            ORDER BY started_at DESC
            LIMIT 2
        )
        SELECT
            d.dataset_name,
            MAX(CASE WHEN r.run_rank = 1 THEN d.rows_loaded END) AS current_rows_loaded,
            MAX(CASE WHEN r.run_rank = 2 THEN d.rows_loaded END) AS previous_rows_loaded,
            MAX(CASE WHEN r.run_rank = 1 THEN d.duration_seconds END) AS current_duration_seconds,
            MAX(CASE WHEN r.run_rank = 2 THEN d.duration_seconds END) AS previous_duration_seconds,
            MAX(CASE WHEN r.run_rank = 1 THEN q.score END) AS current_quality_score,
            MAX(CASE WHEN r.run_rank = 2 THEN q.score END) AS previous_quality_score
        FROM pipeline_dataset_runs d
        JOIN recent_runs r
            ON r.run_id = d.run_id
        LEFT JOIN pipeline_quality_runs q
            ON q.run_id = d.run_id
            AND q.dataset_name = d.dataset_name
        GROUP BY d.dataset_name
        ORDER BY d.dataset_name;
        """,
        engine,
    )


def get_slowest_datasets(limit: int = 3) -> pd.DataFrame:
    health = get_latest_dataset_health()

    if health.empty:
        return health

    return health.sort_values("duration_seconds", ascending=False).head(limit)


def get_incremental_summary() -> dict:
    engine = get_engine()
    ensure_metadata_schema(engine)

    latest_incremental = pd.read_sql(
        """
        WITH latest_run AS (
            SELECT run_id
            FROM pipeline_runs
            ORDER BY started_at DESC
            LIMIT 1
        )
        SELECT
            d.dataset_name,
            d.rows_loaded,
            d.watermark_value,
            s.last_source_rows
        FROM pipeline_dataset_runs d
        LEFT JOIN pipeline_incremental_state s
            ON s.dataset_name = d.dataset_name
        WHERE d.run_id = (SELECT run_id FROM latest_run)
          AND LOWER(COALESCE(d.load_strategy, '')) = 'incremental';
        """,
        engine,
    )

    if latest_incremental.empty:
        return {
            "incremental_datasets": 0,
            "new_records": 0,
            "skipped_records": 0,
            "latest_watermark": "-",
        }

    new_records = int(latest_incremental["rows_loaded"].fillna(0).sum())
    skipped_records = int(
        (latest_incremental["last_source_rows"].fillna(0) - latest_incremental["rows_loaded"].fillna(0))
        .clip(lower=0)
        .sum()
    )

    watermark_candidates = (
        latest_incremental["watermark_value"].dropna().astype(str)
        if "watermark_value" in latest_incremental.columns
        else pd.Series(dtype="object")
    )

    latest_watermark = watermark_candidates.max() if not watermark_candidates.empty else "-"

    return {
        "incremental_datasets": int(len(latest_incremental)),
        "new_records": new_records,
        "skipped_records": skipped_records,
        "latest_watermark": latest_watermark,
    }


def get_quality_distribution() -> dict:
    health = get_latest_dataset_health()

    if health.empty:
        return {"PASS": 0, "FAIL": 0}

    passed = int((health["quality_status"] == "PASS").sum())
    failed = int((health["quality_status"] == "FAIL").sum())

    return {"PASS": passed, "FAIL": failed}
