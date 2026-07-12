"""
Backwards-compatibility shim for core/airflow_runner.py.

The real implementation lives in core/airflow/runner.py.
This module re-exports all public task functions so any legacy imports still work.
"""

from core.airflow.runner import (  # noqa: F401
    run_discover,
    run_schema_validation,
    run_quality_check,
    run_ingest,
    run_pipeline_report,
)

# Legacy alias — old code may call run_dataset(name)
run_dataset = run_ingest

__all__ = [
    "run_discover",
    "run_schema_validation",
    "run_quality_check",
    "run_ingest",
    "run_pipeline_report",
    "run_dataset",
]
