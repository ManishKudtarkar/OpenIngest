import pandas as pd

from core.quality_report import build_quality_report
from core.quality_rules import evaluate_quality_rules
from models.dataset import Dataset
from typing import Optional, Dict, Any


def _read_dataset_df(dataset: Dataset) -> pd.DataFrame:
    """
    Read a dataset using the connector registry if a source: block is present,
    otherwise fall back to reading the local file.
    """
    config = dataset.config or {}
    source_cfg = config.get("source", {})

    if source_cfg:
        from core.connectors.registry import ConnectorRegistry
        source_type = source_cfg.get("type", "csv").lower()
        connector = ConnectorRegistry.get(source_type, source_cfg)
        return connector.read()

    # Legacy: read local file with format detection
    from pathlib import Path
    file_path = dataset.file
    ext = Path(str(file_path)).suffix.lower()

    if ext in (".xlsx", ".xls"):
        return pd.read_excel(file_path, engine="openpyxl")
    if ext == ".json":
        return pd.read_json(file_path)
    if ext in (".parquet", ".pq"):
        return pd.read_parquet(file_path)

    return pd.read_csv(file_path)


def run_quality_checks(dataset: Dataset, df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    if df is None:
        df = _read_dataset_df(dataset)

    checks = evaluate_quality_rules(dataset, df)

    return build_quality_report(dataset, len(df), checks)
