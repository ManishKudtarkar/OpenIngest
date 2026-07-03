from datetime import datetime, timedelta

from airflow import DAG

from core.discovery import discover_datasets
from core.airflow.task_factory import create_ingestion_task, create_quality_task


default_args = {
    "owner": "OpenIngest",
    "depends_on_past": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=1),
}

with DAG(
    dag_id="openingest_dynamic_pipeline",
    start_date=datetime(2025, 1, 1),
    schedule="@daily",
    catchup=False,
    default_args=default_args,
    tags=["OpenIngest"],
) as dag:

    datasets = discover_datasets()

    tasks = []

    for dataset in datasets:

        if not dataset.registered:
            continue

        quality_task = create_quality_task(
            dag,
            dataset,
        )

        task = create_ingestion_task(
            dag,
            dataset,
        )

        quality_task >> task

        tasks.append(task)