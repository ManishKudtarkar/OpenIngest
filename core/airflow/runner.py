from core.discovery import discover_datasets
from core.quality import run_quality_checks
from core.reporting import pipeline_report
from core.validation import validate_dataset
from core.ingestion import ingest_dataset
from utils.metadata_logger import MetadataLogger


def _get_dataset(dataset_name: str):
    dataset = next(
        (d for d in discover_datasets() if d.name == dataset_name),
        None,
    )
    if dataset is None:
        raise ValueError(f"Dataset '{dataset_name}' not found.")
    if not dataset.registered:
        raise ValueError(f"Dataset '{dataset_name}' is not registered in datasets.yaml.")
    return dataset


def run_discover(dataset_name: str) -> dict:
    """Discover dataset from data/raw/ and confirm registration."""
    dataset = _get_dataset(dataset_name)
    return {
        "dataset": dataset.name,
        "file": str(dataset.file),
        "registered": dataset.registered,
        "columns": dataset.columns,
        "rows": dataset.rows,
    }


def run_schema_validation(dataset_name: str) -> dict:
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


def run_quality_check(dataset_name: str, run_id: str | None = None) -> dict:
    """Run non-null, unique, and range quality checks. Fails task if quality FAIL."""
    dataset = _get_dataset(dataset_name)
    result = run_quality_checks(dataset)

    if run_id:
        MetadataLogger().log_quality_result(run_id, dataset, result)

    if not result["passed"]:
        raise ValueError(
            f"Quality check FAILED for '{dataset_name}': "
            f"score={result['score']:.2f}%, "
            f"failed_checks={result['checks_failed']}"
        )

    return result


def run_ingest(dataset_name: str, run_id: str | None = None) -> dict:
    """Ingest dataset using configured load strategy (replace / append / incremental)."""
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
