from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.empty import EmptyOperator
from airflow.utils.task_group import TaskGroup

from utils.config_loader import load_dataset_config
from core.airflow.runner import (
    run_discover,
    run_schema_validation,
    run_quality_check,
    run_ingest,
    run_pipeline_report,
)


default_args = {
    "owner": "OpenIngest",
    "depends_on_past": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=1),
    "email_on_failure": False,
}

with DAG(
    dag_id="openingest_dynamic_pipeline",
    description="Configuration-driven ingestion: discover -> validate -> quality -> ingest -> report",
    start_date=datetime(2025, 1, 1),
    schedule="@daily",
    catchup=False,
    default_args=default_args,
    tags=["openingest", "ingestion", "quality", "incremental"],
) as dag:

    start = EmptyOperator(task_id="start")
    end = EmptyOperator(task_id="end", trigger_rule="all_done")

    report = PythonOperator(
        task_id="pipeline_report",
        python_callable=run_pipeline_report,
        trigger_rule="all_done",
    )

    config = load_dataset_config()
    registered = list(config["datasets"].keys())

    dataset_end_tasks = []

    for name in registered:
        ds_config = config["datasets"][name]
        strategy = ds_config.get("load_strategy", "replace")

        with TaskGroup(group_id=name) as tg:

            discover_task = PythonOperator(
                task_id="discover",
                python_callable=run_discover,
                op_kwargs={"dataset_name": name},
            )

            validate_task = PythonOperator(
                task_id="validate_schema",
                python_callable=run_schema_validation,
                op_kwargs={"dataset_name": name},
            )

            quality_task = PythonOperator(
                task_id="quality_check",
                python_callable=run_quality_check,
                op_kwargs={"dataset_name": name, "run_id": "{{ dag_run.run_id }}"},
            )

            ingest_task = PythonOperator(
                task_id="ingest",
                python_callable=run_ingest,
                op_kwargs={"dataset_name": name, "run_id": "{{ dag_run.run_id }}"},
                doc_md=f"Strategy: `{strategy}`",
            )

            discover_task >> validate_task >> quality_task >> ingest_task

        start >> tg
        dataset_end_tasks.append(ingest_task)

    for t in dataset_end_tasks:
        t >> report

    report >> end
