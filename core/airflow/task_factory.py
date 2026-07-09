from typing import Any

from airflow.operators.python import PythonOperator

from core.airflow.runner import run_ingest, run_quality_check


def create_ingestion_task(dag: Any, dataset: Any) -> PythonOperator:
    """
    Creates one Airflow task for one dataset.
    """

    return PythonOperator(
        task_id=f"ingest_{dataset.name}",
        python_callable=run_ingest,
        op_kwargs={
            "dataset_name": dataset.name,
            "run_id": "{{ dag_run.run_id }}",
        },
        dag=dag,
    )


def create_quality_task(dag: Any, dataset: Any) -> PythonOperator:
    """
    Creates one Airflow quality task for one dataset.
    """

    return PythonOperator(
        task_id=f"quality_{dataset.name}",
        python_callable=run_quality_check,
        op_kwargs={
            "dataset_name": dataset.name,
            "run_id": "{{ dag_run.run_id }}",
        },
        dag=dag,
    )