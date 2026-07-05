"""
Dataset discovery engine.

v1.0 — scans data/raw/*.csv and matches against datasets.yaml
v2.0 — also supports datasets with an explicit 'source' block (cloud/REST/multi-format)
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd

from models.dataset import Dataset
from utils.config_loader import load_dataset_config

RAW_FOLDER = Path("data/raw")


def _read_sample(source_cfg: Dict[str, Any], file_hint: Optional[str]) -> Optional[pd.DataFrame]:
    """
    Try to read the first 5 rows from a dataset source for column discovery.
    Returns None if the source is remote/unreachable (non-blocking).
    """
    # Cloud / REST sources — skip local sample read; columns resolved at ingest time
    source_type = (source_cfg or {}).get("type", "").lower()
    if source_type in ("s3", "azure", "gcs", "rest", "api"):
        return None

    # Local file source via connector
    if source_type in ("excel", "xlsx", "json", "parquet"):
        try:
            from core.connectors.registry import ConnectorRegistry
            connector = ConnectorRegistry.get(source_type, source_cfg)
            df = connector.read()
            return df.head(5)
        except Exception:
            return None

    # Default CSV path
    if file_hint:
        csv_path = RAW_FOLDER / file_hint
        if csv_path.exists():
            try:
                return pd.read_csv(csv_path, nrows=5)
            except Exception:
                return None

    return None


def _count_rows(source_cfg: Dict[str, Any], file_hint: Optional[str]) -> int:
    """Estimate row count for local files. Returns 0 for remote sources."""
    source_type = (source_cfg or {}).get("type", "").lower()
    if source_type in ("s3", "azure", "gcs", "rest", "api"):
        return 0

    if file_hint:
        csv_path = RAW_FOLDER / file_hint
        if csv_path.exists():
            try:
                with open(csv_path, "r", encoding="utf-8") as f:
                    return sum(1 for _ in f) - 1
            except Exception:
                return 0

    return 0


def discover_datasets() -> List[Dataset]:
    """
    Discover and register all datasets from configuration.

    Logic:
    1. Load datasets.yaml
    2. For each registered dataset, build a Dataset object
    3. For local CSV datasets, also scan data/raw/ for unregistered files
    """
    config = load_dataset_config()
    configured: Dict[str, Any] = config.get("datasets", {})

    # ── Registered datasets (YAML-driven) ──────────────────────────────────
    registered_datasets: List[Dataset] = []

    for dataset_name, ds_cfg in configured.items():
        source_cfg: Dict[str, Any] = ds_cfg.get("source", {})
        file_hint: Optional[str] = ds_cfg.get("file") or source_cfg.get("file")

        # Determine the physical file path for local sources
        file_path: Optional[Path] = None
        source_type = source_cfg.get("type", "csv").lower() if source_cfg else "csv"

        if source_type in ("csv", "") or (not source_cfg and file_hint):
            if file_hint:
                candidate = RAW_FOLDER / file_hint
                if candidate.exists():
                    file_path = candidate
            elif not source_cfg:
                # Legacy: match by dataset_name.csv
                auto = RAW_FOLDER / f"{dataset_name}.csv"
                if auto.exists():
                    file_path = auto

        sample_df = _read_sample(
            source_cfg or ({"type": "csv", "file": file_hint} if file_hint else {}),
            file_hint,
        )

        row_count = _count_rows(
            source_cfg or ({"type": "csv", "file": file_hint} if file_hint else {}),
            file_hint,
        )

        columns: List[str] = list(sample_df.columns) if sample_df is not None else []

        dataset = Dataset(
            name=dataset_name,
            file=file_path or Path(file_hint or f"{dataset_name}.csv"),
            registered=True,
            table=ds_cfg.get("staging_table"),
            config=ds_cfg,
            rows=row_count,
            columns=columns,
            column_count=len(columns),
            file_size_bytes=file_path.stat().st_size if file_path else 0,
        )
        registered_datasets.append(dataset)

    # ── Unregistered local CSV files (legacy scan) ──────────────────────────
    registered_files = {
        ds_cfg.get("file", "")
        for ds_cfg in configured.values()
        if ds_cfg.get("file")
    }

    for csv_path in RAW_FOLDER.glob("*.csv"):
        if csv_path.name in registered_files:
            continue  # Already registered above

        try:
            df = pd.read_csv(csv_path, nrows=5)
            with open(csv_path, "r", encoding="utf-8") as f:
                row_count = sum(1 for _ in f) - 1
        except Exception:
            continue

        dataset = Dataset(
            name=csv_path.stem,
            file=csv_path,
            registered=False,
            table=None,
            config=None,
            rows=row_count,
            columns=list(df.columns),
            column_count=len(df.columns),
            file_size_bytes=csv_path.stat().st_size,
        )
        registered_datasets.append(dataset)

    return registered_datasets
