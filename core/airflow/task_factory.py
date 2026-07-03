from airflow.operators.python import PythonOperator

from core.airflow.runner import run_dataset, run_quality_check


def create_ingestion_task(dag, dataset):
    """
    Creates one Airflow task for one dataset.
    """

    return PythonOperator(
        task_id=f"ingest_{dataset.name}",
        python_callable=run_dataset,
        op_kwargs={
            "dataset_name": dataset.name,
            "run_id": "{{ dag_run.run_id }}",
        },
        dag=dag,
    )


def create_quality_task(dag, dataset):
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