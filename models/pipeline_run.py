from dataclasses import dataclass, field
from datetime import datetime

from models.dataset import Dataset


@dataclass
class PipelineRun:

    run_id: str

    started_at: datetime

    finished_at: datetime | None = None

    status: str = "SUCCESS"

    datasets: list[Dataset] = field(default_factory=list)

    total_rows: int = 0

    total_duration: float = 0