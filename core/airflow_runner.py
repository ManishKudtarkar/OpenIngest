from core.discovery import discover_datasets
from core.ingestion import ingest_dataset


def run_dataset(dataset_name: str):
    """
    Airflow entrypoint.

    Executes ingestion for one dataset.
    """

    datasets = discover_datasets()

    dataset = next(
        (
            d
            for d in datasets
            if d.name == dataset_name
        ),
        None,
    )

    if dataset is None:
        raise ValueError(
            f"Dataset '{dataset_name}' not found."
        )

    if not dataset.registered:
        print(
            f"Skipping '{dataset_name}' "
            f"(dataset not registered)"
        )

        return {
            "dataset": dataset_name,
            "status": "SKIPPED",
            "rows_loaded": 0,
        }

    dataset = ingest_dataset(dataset)

    print(
        f"\nFinished {dataset.name}"
        f"\nRows Loaded : {dataset.rows_loaded:,}"
        f"\nStatus      : {dataset.load_status}"
    )

    # Airflow XCom supports JSON only
    return {
        "dataset": dataset.name,
        "rows_loaded": dataset.rows_loaded,
        "status": dataset.load_status,
    }