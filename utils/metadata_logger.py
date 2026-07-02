from datetime import datetime
import uuid

import pandas as pd

from models.dataset import Dataset
from models.pipeline_run import PipelineRun
from utils.db import get_engine


class MetadataLogger:

    def __init__(self):

        self.engine = get_engine()

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