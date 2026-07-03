import json
from datetime import datetime
import uuid

import pandas as pd
from sqlalchemy import text

from models.dataset import Dataset
from models.pipeline_run import PipelineRun
from utils.db import get_engine


def ensure_metadata_schema(engine):

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

    def __init__(self):

        self.engine = get_engine()
        ensure_metadata_schema(self.engine)

    def create_pipeline_run(self):

        run = PipelineRun(
            run_id=f"OI-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}",
            started_at=datetime.now(),
        )

        return run

    def log_dataset(self, run: PipelineRun, dataset: Dataset):

        df = pd.DataFrame(
            [
                {
                    "run_id": run.run_id,
                    "dataset_name": dataset.name,
                    "target_table": dataset.table,
                    "rows_loaded": dataset.rows_loaded,
                    "duration_seconds": dataset.duration_seconds,
                    "status": dataset.load_status,
                    "auto_created_table": getattr(
                        dataset,
                        "auto_created_table",
                        False,
                    ),
                    "loaded_at": datetime.now(),
                }
            ]
        )

        df.to_sql(
            "pipeline_dataset_runs",
            self.engine,
            if_exists="append",
            index=False,
        )

    def log_quality_result(self, run_id: str, dataset: Dataset, quality_result: dict):

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

        df.to_sql(
            "pipeline_quality_runs",
            self.engine,
            if_exists="append",
            index=False,
        )

    def finish_pipeline(self, run: PipelineRun):

        run.finished_at = datetime.now()

        run.total_duration = round(
            (
                run.finished_at
                - run.started_at
            ).total_seconds(),
            2,
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

        df.to_sql(
            "pipeline_runs",
            self.engine,
            if_exists="append",
            index=False,
        )