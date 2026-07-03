from core.discovery import discover_datasets
from core.quality import run_quality_checks
from core.validation import validate_dataset
from core.ingestion import ingest_dataset
from utils.metadata_logger import MetadataLogger


def run_quality_check(dataset_name: str, run_id: str | None = None):
    datasets = discover_datasets()

    dataset = next(
        (d for d in datasets if d.name == dataset_name),
        None,
    )

    if dataset is None:
        raise ValueError(f"{dataset_name} not found.")

    if not dataset.registered:
        raise ValueError(f"{dataset_name} not registered.")

    result = run_quality_checks(dataset)

    if run_id:
        MetadataLogger().log_quality_result(run_id, dataset, result)

    if not result["passed"]:
        raise ValueError(
            f"Data quality failed for {dataset.name}: {result['score']:.2f}%"
        )

    return result


def run_dataset(
    dataset_name: str,
    run_id: str | None = None,
    quality_result: dict | None = None,
):
    datasets = discover_datasets()

    dataset = next(
        (d for d in datasets if d.name == dataset_name),
        None,
    )

    if dataset is None:
        raise ValueError(f"{dataset_name} not found.")

    if not dataset.registered:
        print(f"{dataset_name} not registered.")
        return None

    # -----------------------------
    # VALIDATE BEFORE INGESTION
    # -----------------------------
    result = validate_dataset(dataset)

    dataset.schema_valid = result["valid"]

    if not dataset.schema_valid:
        raise ValueError(
            f"Schema validation failed for {dataset.name}\n"
            f"Missing columns: {result['missing']}\n"
            f"Extra columns: {result['extra']}"
        )

    if quality_result is None:
        quality_result = run_quality_check(dataset_name, run_id=run_id)

    if not quality_result.get("passed", False):
        raise ValueError(
            f"Data quality failed for {dataset.name}: {quality_result['score']:.2f}%"
        )

    dataset = ingest_dataset(dataset)

    return {
        "dataset": dataset.name,
        "rows_loaded": dataset.rows_loaded,
        "status": dataset.load_status,
        "quality_score": quality_result["score"],
        "quality_status": quality_result["status"],
    }