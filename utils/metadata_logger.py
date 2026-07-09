import json
from datetime import datetime
import uuid
from typing import Any, Dict

import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Engine

from models.dataset import Dataset
from models.pipeline_run import PipelineRun
from utils.db import get_engine


def ensure_metadata_schema(engine: Engine) -> None:
    with engine.begin() as conn:

        conn.execute(
            text(
                """
                ALTER TABLE IF EXISTS pipeline_dataset_runs
                ADD COLUMN IF NOT EXISTS auto_created_table BOOLEAN DEFAULT FALSE;
                """
            )
        )

        conn.execute(
            text(
                """
                ALTER TABLE IF EXISTS pipeline_dataset_runs
                ADD COLUMN IF NOT EXISTS load_strategy VARCHAR(20);
                """
            )
        )

        conn.execute(
            text(
                """
                ALTER TABLE IF EXISTS pipeline_dataset_runs
                ADD COLUMN IF NOT EXISTS load_mode VARCHAR(20);
                """
            )
        )

        conn.execute(
            text(
                """
                ALTER TABLE IF EXISTS pipeline_dataset_runs
                ADD COLUMN IF NOT EXISTS incremental_column VARCHAR(100);
                """
            )
        )

        conn.execute(
            text(
                """
                ALTER TABLE IF EXISTS pipeline_dataset_runs
                ADD COLUMN IF NOT EXISTS watermark_value TEXT;
                """
            )
        )

        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS pipeline_incremental_state (
                    dataset_name VARCHAR(100) PRIMARY KEY,
                    target_table VARCHAR(100),
                    load_strategy VARCHAR(20),
                    primary_key_columns TEXT,
                    incremental_column VARCHAR(100),
                    hash_columns TEXT,
                    last_watermark_value TEXT,
                    last_rows_loaded BIGINT,
                    last_source_rows BIGINT,
                    last_loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
        )

        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS pipeline_quality_runs (
                    id SERIAL PRIMARY KEY,
                    run_id VARCHAR(50),
                    dataset_name VARCHAR(100),
                    target_table VARCHAR(100),
                    rows_checked BIGINT,
                    checks_total INTEGER,
                    checks_passed INTEGER,
                    checks_failed INTEGER,
                    score DOUBLE PRECISION,
                    status VARCHAR(20),
                    details TEXT,
                    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
        )


class MetadataLogger:

    def __init__(self) -> None:

        self.engine = get_engine()
        ensure_metadata_schema(self.engine)

    def create_pipeline_run(self) -> PipelineRun:

        run = PipelineRun(
            run_id=f"OI-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}",
            started_at=datetime.now(),
        )

        return run

    def log_dataset(self, run: PipelineRun, dataset: Dataset) -> None:

        df = pd.DataFrame(
            [
                {
                    "run_id": run.run_id,
                    "dataset_name": dataset.name,
                    "target_table": dataset.table,
                    "rows_loaded": dataset.rows_loaded,
                    "duration_seconds": dataset.duration_seconds,
                    "status": dataset.load_status,
                    "auto_created_table": getattr(dataset, "auto_created_table", False),
                    "load_strategy": getattr(dataset, "load_strategy", None),
                    "load_mode": getattr(dataset, "load_mode", None),
                    "incremental_column": getattr(dataset, "incremental_column", None),
                    "watermark_value": getattr(dataset, "watermark_value", None),
                    "loaded_at": datetime.now(),
                }
            ]
        )

        with self.engine.begin() as conn:
            df.to_sql("pipeline_dataset_runs", conn, if_exists="append", index=False)

    def log_quality_result(self, run_id: str, dataset: Dataset, quality_result: Dict[str, Any]) -> None:

        df = pd.DataFrame(
            [
                {
                    "run_id": run_id,
                    "dataset_name": dataset.name,
                    "target_table": dataset.table,
                    "rows_checked": quality_result.get("rows_checked", 0),
                    "checks_total": quality_result.get("checks_total", 0),
                    "checks_passed": quality_result.get("checks_passed", 0),
                    "checks_failed": quality_result.get("checks_failed", 0),
                    "score": quality_result.get("score", 0.0),
                    "status": quality_result.get("status", "UNKNOWN"),
                    "details": json.dumps(quality_result, default=str),
                    "evaluated_at": datetime.now(),
                }
            ]
        )

        try:
            with self.engine.begin() as conn:
                df.to_sql("pipeline_quality_runs", conn, if_exists="append", index=False)
        except Exception:
            # Reconnect and retry once on stale connection
            self.engine = get_engine()
            with self.engine.begin() as conn:
                df.to_sql("pipeline_quality_runs", conn, if_exists="append", index=False)

    def finish_pipeline(self, run: PipelineRun) -> None:

        run.finished_at = datetime.now()
        run.total_duration = round(
            (run.finished_at - run.started_at).total_seconds(), 2
        )

        df = pd.DataFrame(
            [
                {
                    "run_id": run.run_id,
                    "started_at": run.started_at,
                    "finished_at": run.finished_at,
                    "status": run.status,
                    "total_datasets": len(run.datasets),
                    "total_rows": run.total_rows,
                    "total_duration": run.total_duration,
                }
            ]
        )

        with self.engine.begin() as conn:
            df.to_sql("pipeline_runs", conn, if_exists="append", index=False)