from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, Optional


def _load_env() -> None:
    """
    Load .env into os.environ before any task runs.
    Airflow workers don't inherit the host .env, so we do it explicitly.
    The .env is mounted into the container at /opt/airflow/.env.
    """
    candidates = [
        Path("/opt/airflow/.env"),
        Path(__file__).resolve().parents[2] / ".env",
    ]
    for env_path in candidates:
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k and k not in os.environ:
                        os.environ[k] = v
            break


# Load on module import so all tasks in this worker process get the env
_load_env()

from core.discovery import discover_datasets  # noqa: E402
from core.quality import run_quality_checks  # noqa: E402
from core.reporting import pipeline_report  # noqa: E402
from core.validation import validate_dataset  # noqa: E402
from core.ingestion import ingest_dataset, _read_dataset  # noqa: E402
from models.dataset import Dataset  # noqa: E402
from utils.metadata_logger import MetadataLogger  # noqa: E402


def _get_dataset(dataset_name: str) -> Dataset:
    dataset = next(
        (d for d in discover_datasets() if d.name == dataset_name),
        None,
    )
    if dataset is None:
        raise ValueError(f"Dataset '{dataset_name}' not found.")
    if not dataset.registered:
        raise ValueError(f"Dataset '{dataset_name}' is not registered in datasets.yaml.")
    return dataset


def run_discover(dataset_name: str) -> Dict[str, Any]:
    """Discover dataset and confirm registration."""
    dataset = _get_dataset(dataset_name)
    return {
        "dataset": dataset.name,
        "file": str(dataset.file),
        "registered": dataset.registered,
        "columns": dataset.columns,
        "rows": dataset.rows,
    }


def run_schema_validation(dataset_name: str) -> Dict[str, Any]:
    """Validate required columns against datasets.yaml config."""
    dataset = _get_dataset(dataset_name)
    result = validate_dataset(dataset)

    if not result["valid"]:
        raise ValueError(
            f"Schema validation failed for '{dataset_name}'. "
            f"Missing: {result['missing']}. Extra: {result['extra']}."
        )

    return {
        "dataset": dataset_name,
        "valid": True,
        "missing": result["missing"],
        "extra": result["extra"],
    }


def run_quality_check(dataset_name: str, run_id: Optional[str] = None) -> Dict[str, Any]:
    """Run quality checks. Reads data once and passes df to avoid double download."""
    dataset = _get_dataset(dataset_name)

    df = _read_dataset(dataset)
    dataset.columns = list(df.columns)
    dataset.rows = len(df)

    result = run_quality_checks(dataset, df=df)

    if run_id:
        MetadataLogger().log_quality_result(run_id, dataset, result)

    if not result["passed"]:
        raise ValueError(
            f"Quality check FAILED for '{dataset_name}': "
            f"score={result['score']:.2f}%, "
            f"failed_checks={result['checks_failed']}"
        )

    return result


def run_ingest(dataset_name: str, run_id: Optional[str] = None) -> Dict[str, Any]:
    """Ingest dataset using configured load strategy."""
    dataset = _get_dataset(dataset_name)
    dataset = ingest_dataset(dataset)

    if run_id:
        logger = MetadataLogger()
        run = logger.create_pipeline_run()
        run.run_id = run_id
        logger.log_dataset(run, dataset)

    return {
        "dataset": dataset.name,
        "rows_loaded": dataset.rows_loaded,
        "load_strategy": dataset.load_strategy,
        "load_mode": dataset.load_mode,
        "watermark_value": dataset.watermark_value,
        "status": dataset.load_status,
    }


def run_pipeline_report() -> None:
    """Print execution report for the latest pipeline run."""
    pipeline_report()
