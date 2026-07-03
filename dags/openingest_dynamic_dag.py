from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.empty import EmptyOperator
from airflow.utils.task_group import TaskGroup

from core.discovery import discover_datasets
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
    description="Configuration-driven ingestion: discover → validate → quality → ingest → report",
    start_date=datetime(2025, 1, 1),
    schedule="@daily",
    catchup=False,
    default_args=default_args,
    tags=["openingest", "ingestion", "quality", "incremental"],
    doc_md="""
## OpenIngest Dynamic Pipeline

Automatically discovers, validates, quality-checks, and ingests every registered dataset.

### Architecture per dataset
```
discover → validate_schema → quality_check → ingest
```

### Load strategies
- **replace** — truncate and reload
- **append** — insert new rows
- **incremental** — watermark + SHA-256 change detection + upsert

### Adding a new dataset
Register it in `configs/datasets.yaml`. No DAG changes required.
""",
) as dag:

    start = EmptyOperator(task_id="start")
    end = EmptyOperator(task_id="end", trigger_rule="all_done")

    report = PythonOperator(
        task_id="pipeline_report",
        python_callable=run_pipeline_report,
        trigger_rule="all_done",
    )

    datasets = discover_datasets()
    registered = [d for d in datasets if d.registered]

    dataset_end_tasks = []

    for dataset in registered:

        with TaskGroup(group_id=dataset.name) as tg:

            discover_task = PythonOperator(
                task_id="discover",
                python_callable=run_discover,
                op_kwargs={"dataset_name": dataset.name},
                doc_md=f"Discover `{dataset.name}` from `data/raw/` and load config.",
            )

            validate_task = PythonOperator(
                task_id="validate_schema",
                python_callable=run_schema_validation,
                op_kwargs={"dataset_name": dataset.name},
                doc_md=f"Validate required columns for `{dataset.name}`.",
            )

            quality_task = PythonOperator(
                task_id="quality_check",
                python_callable=run_quality_check,
                op_kwargs={
                    "dataset_name": dataset.name,
                    "run_id": "{{ dag_run.run_id }}",
                },
                doc_md=f"Run non-null, unique, and range quality checks for `{dataset.name}`.",
            )

            ingest_task = PythonOperator(
                task_id="ingest",
                python_callable=run_ingest,
                op_kwargs={
                    "dataset_name": dataset.name,
                    "run_id": "{{ dag_run.run_id }}",
                },
                doc_md=f"Ingest `{dataset.name}` using strategy: `{dataset.config.get('load_strategy', 'replace')}`.",
            )

            discover_task >> validate_task >> quality_task >> ingest_task

        start >> tg
        dataset_end_tasks.append(ingest_task)

    for t in dataset_end_tasks:
        t >> report

    report >> end
