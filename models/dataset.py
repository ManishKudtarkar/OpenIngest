from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path


@dataclass
class Dataset:

    name: str
    file: Path

    registered: bool = False
    table: str | None = None
    config: dict | None = None
    load_strategy: str = "replace"
    incremental_column: str | None = None
    load_mode: str = "FULL"
    watermark_value: str | None = None

    rows: int = 0
    columns: list[str] = field(default_factory=list)
    column_count: int = 0

    file_size_bytes: int = 0

    checksum: str | None = None

    schema_valid: bool = False

    auto_created_table: bool = False

    quality_checked: bool = False

    quality_score: float = 0.0

    quality_status: str = "NOT_RUN"

    quality_summary: str | None = None

    load_status: str = "Pending"

    rows_loaded: int = 0

    duration_seconds: float = 0.0

    started_at: datetime | None = None

    finished_at: datetime | None = None