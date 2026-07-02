from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime


@dataclass
class Dataset:

    name: str
    file: Path

    registered: bool = False
    table: Optional[str] = None
    config: Optional[Dict] = None

    rows: int = 0
    columns: List[str] = field(default_factory=list)
    column_count: int = 0

    file_size_bytes: int = 0

    checksum: Optional[str] = None

    schema_valid: bool = False

    load_status: str = "Pending"

    rows_loaded: int = 0

    duration_seconds: float = 0.0

    started_at: Optional[datetime] = None

    finished_at: Optional[datetime] = None