# OpenIngest

### Configuration-Driven Data Ingestion Framework

[![PyPI](https://img.shields.io/pypi/v/openingest?color=indigo&label=PyPI)](https://pypi.org/project/openingest/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://pypi.org/project/openingest/)
[![CI](https://github.com/ManishKudtarkar/OpenIngest/actions/workflows/ci.yml/badge.svg)](https://github.com/ManishKudtarkar/OpenIngest/actions)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Airflow](https://img.shields.io/badge/Apache%20Airflow-2.9-red)](https://airflow.apache.org/)

OpenIngest is a production-grade, configuration-driven data ingestion framework. Register a dataset once in YAML and OpenIngest handles discovery, schema validation, data quality, PostgreSQL loading, metadata logging, Airflow DAG generation, and notifications — automatically.

**v2.5 ships connectors for Amazon S3, Azure Blob, Google Cloud Storage, REST APIs, Excel, JSON, and Parquet — plus a built-in cron scheduler, Slack/email notifications, and a data lineage engine.**

---

## Install

```bash
pip install openingest
```

Optional extras for cloud connectors and multi-format support:

```bash
pip install openingest[s3]        # Amazon S3
pip install openingest[azure]     # Azure Blob Storage
pip install openingest[gcs]       # Google Cloud Storage
pip install openingest[excel]     # Excel (.xlsx / .xls)
pip install openingest[parquet]   # Parquet
pip install openingest[api]       # REST API
pip install openingest[v2]        # All of the above
```

---

## Quick Start

```bash
# 1. Install
pip install openingest

# 2. Create a project
openingest init my-pipeline
cd my-pipeline

# 3. Set your database URL
# Edit .env:
# DATABASE_URL=postgresql://user:password@localhost:5432/openingest

# 4. Start PostgreSQL
docker compose up -d

# 5. Drop CSV/Excel/Parquet files into data/raw/ and infer config
openingest infer data/raw/customers.csv

# 6. Run
openingest run
```

Expected output:

```
════════════════════════════════════════════════════════════════════════════════
OPENINGEST
════════════════════════════════════════════════════════════════════════════════
Run ID : OI-20260709-3BB09C

  ✓  customers    →  stg_customers    replace       100.00%
  ✓  orders       →  stg_orders       incremental    98.50%
  ✓  products     →  stg_products     replace       100.00%

────────────────────────────────────────────────────────────────────────────────
PIPELINE SUMMARY
────────────────────────────────────────────────────────────────────────────────
Datasets Found    : 3
Processed         : 3
Rows Loaded       : 174,777
Duration          : 4.21 sec
Status            : SUCCESS ✓
════════════════════════════════════════════════════════════════════════════════
```

---

## Architecture

```
Source (CSV / Excel / JSON / Parquet / S3 / Azure Blob / GCS / REST API)
        │
        ▼
Dataset Discovery          core/discovery.py
        │
        ▼
Schema Validation          core/validation.py
        │
        ▼
Data Quality Engine        core/quality.py
        │
        ▼
Ingestion Engine           core/ingestion.py
  ├── replace      (truncate + reload)
  ├── append       (insert new rows)
  └── incremental  (watermark + SHA-256 hash CDC + upsert)
        │
        ▼
PostgreSQL Staging         utils/db.py  (auto-created tables)
        │
        ▼
Metadata & Audit Logger    utils/metadata_logger.py
        │
        ▼
Execution Report           core/reporting.py
        │
        ▼
Notifications              core/notifications.py  (Slack / Email)
        │
        ▼
Airflow Task Factory       core/airflow/task_factory.py
        │
        ▼
Apache Airflow Scheduler   dags/openingest_dynamic_dag.py
```

---

## CLI Reference

```bash
openingest run                          # Full pipeline — all datasets
openingest run --dry-run                # Validate + quality check, no DB writes
openingest run --dataset orders         # Single dataset only

openingest validate                     # Schema validation for all datasets
openingest quality                      # Quality scores for all datasets
openingest report                       # Latest execution report
openingest history                      # Full run history
openingest history --limit 10           # Last 10 runs
openingest dashboard                    # Monitoring dashboard

openingest infer orders.csv             # Infer datasets.yaml config from a CSV
openingest profile orders.csv           # Profile a CSV file
openingest add-dataset                  # Register a dataset interactively
openingest discover                     # Scan data/raw/ and register unregistered CSVs

openingest scheduler start              # Built-in cron scheduler (no Airflow needed)
openingest scheduler start --cron @daily
openingest scheduler start --cron "0 6 * * *"
openingest schedule daily               # Set pipeline schedule

openingest airflow build                # Generate Airflow DAG from datasets.yaml
openingest docker init                  # Generate docker-compose.yml
openingest doctor                       # Check environment and DB connectivity
openingest init <project>               # Scaffold a new OpenIngest project
openingest version                      # Show installed version
```

---

## Dataset Configuration

All datasets live in `configs/datasets.yaml`. No Python required.

### Local CSV

```yaml
customers:
  file: customers.csv
  staging_table: stg_customers
  load_strategy: replace
  primary_key:
    - customer_id
  required_columns:
    - customer_id
    - name
    - email
  non_null_columns:
    - customer_id
    - email
  unique_columns:
    - customer_id
```

### Incremental load (watermark + hash CDC)

```yaml
orders:
  file: orders.csv
  staging_table: stg_orders
  load_strategy: incremental
  incremental_column: order_time
  hash_columns:
    - customer_id
    - total_usd
    - payment_method
  primary_key:
    - order_id
  required_columns:
    - order_id
    - customer_id
    - order_time
    - total_usd
```

### Amazon S3

```yaml
orders_s3:
  source:
    type: s3
    bucket: my-bucket
    key: orders/orders.parquet
    region: us-east-1
    aws_access_key_id: ${AWS_ACCESS_KEY_ID}
    aws_secret_access_key: ${AWS_SECRET_ACCESS_KEY}
  staging_table: stg_orders
  load_strategy: incremental
  incremental_column: order_time
  primary_key: [order_id]
  required_columns: [order_id, customer_id, order_time, total_usd]
```

### Azure Blob Storage

```yaml
products_azure:
  source:
    type: azure
    container: my-container
    blob: products/products.parquet
    connection_string: ${AZURE_STORAGE_CONNECTION_STRING}
  staging_table: stg_products
  load_strategy: replace
  primary_key: [product_id]
  required_columns: [product_id, name, price_usd]
```

### Google Cloud Storage

```yaml
events_gcs:
  source:
    type: gcs
    bucket: my-bucket
    object: events/events.csv
    project: my-gcp-project
  staging_table: stg_events
  load_strategy: incremental
  incremental_column: timestamp
  primary_key: [event_id]
  required_columns: [event_id, session_id, timestamp, event_type]
```

### REST API

```yaml
api_orders:
  source:
    type: rest
    url: https://api.company.com/v1/orders
    method: GET
    headers:
      Authorization: Bearer ${API_TOKEN}
    record_path: data
    pagination:
      type: offset
      param: offset
      limit_param: limit
      limit: 500
      max_pages: 20
  staging_table: stg_api_orders
  load_strategy: incremental
  incremental_column: created_at
  primary_key: [id]
  required_columns: [id, customer_id, total, created_at]
```

### Excel

```yaml
budget:
  source:
    type: excel
    file: data/raw/budget_2026.xlsx
    sheet: Q1
  staging_table: stg_budget
  load_strategy: replace
  required_columns: [department, amount, quarter]
```

### Parquet

```yaml
events_parquet:
  source:
    type: parquet
    file: data/raw/events.parquet
  staging_table: stg_events_parquet
  load_strategy: incremental
  incremental_column: timestamp
  primary_key: [event_id]
  required_columns: [event_id, session_id, timestamp, event_type]
```

---

## Load Strategies

| Strategy | Behaviour | Use case |
|---|---|---|
| `replace` | Truncate + full reload every run | Reference tables, product catalogs |
| `append` | Insert new rows only | Immutable event logs |
| `incremental` | Watermark filter + SHA-256 hash CDC + upsert | Orders, transactions, mutable time-series |

---

## Connectors

| Source | `type:` | Extra |
|---|---|---|
| CSV | `csv` | built-in |
| JSON / NDJSON | `json` | built-in |
| Excel | `excel` | `pip install openingest[excel]` |
| Parquet | `parquet` | `pip install openingest[parquet]` |
| Amazon S3 | `s3` | `pip install openingest[s3]` |
| Azure Blob | `azure` | `pip install openingest[azure]` |
| Google Cloud Storage | `gcs` | `pip install openingest[gcs]` |
| REST API | `rest` | `pip install openingest[api]` |

---

## Data Quality Rules

Defined per dataset in `configs/validation_rules.yaml`:

```yaml
customers:
  type_checks:
    customer_id: integer
    age: integer
    signup_date: datetime
  range_checks:
    age:
      min: 0
      max: 120
  regex_checks:
    email: '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  custom_rules:
    - name: no_placeholder_emails
      condition: "email.str.lower() != 'test@example.com'"
      message: "Customer email must not be a placeholder"
```

Supported checks: `type_checks`, `range_checks`, `regex_checks`, `custom_rules`, `non_null_columns`, `unique_columns`, `primary_key`.

---

## Notifications

Configure in `configs/pipeline.yaml`:

```yaml
notifications:
  slack:
    webhook: ${SLACK_WEBHOOK_URL}
    on: [success, failure]
  email:
    smtp_host: smtp.company.com
    smtp_port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
    to:
      - data-team@company.com
    on: [failure]
```

---

## Built-in Scheduler

Run on a cron schedule without Airflow:

```bash
openingest scheduler start --cron "0 6 * * *"   # every day at 6am
openingest scheduler start --cron @daily
openingest scheduler start --cron @hourly
```

---

## Data Lineage

```python
from core.lineage import LineageGraph

graph = LineageGraph()
graph.add_dataset_lineage(dataset)

graph.print_ascii()    # terminal tree
graph.to_mermaid()     # Mermaid diagram syntax
graph.to_dict()        # JSON for web UI / API
```

```
  customers
  ├─ customers.csv
  ├─ Dataset Discovery
  ├─ Schema Validation  [PASS]
  ├─ Quality Engine     [PASS]  100.0%
  ├─ Ingest (replace)   174,777 rows
  └─ stg_customers
```

---

## Metadata Tables

| Table | Contents |
|---|---|
| `pipeline_runs` | One row per pipeline run — run ID, status, duration, rows |
| `pipeline_dataset_runs` | One row per dataset per run — rows, duration, strategy, watermark |
| `pipeline_quality_runs` | Quality scores and check details per dataset per run |
| `pipeline_incremental_state` | Watermark and hash config persisted between runs |

---

## Airflow DAG

One DAG — `openingest_dynamic_pipeline` — generated from `datasets.yaml` at parse time. Each registered dataset becomes a 4-task group:

```
start
  ├── customers   [discover → validate_schema → quality_check → ingest]
  ├── orders      [discover → validate_schema → quality_check → ingest]
  └── products    [discover → validate_schema → quality_check → ingest]
        ↓
  pipeline_report
        ↓
       end
```

Add a dataset to `datasets.yaml` → task group appears automatically. No DAG edits.

```bash
openingest airflow build    # generate/update the DAG file
```

---

## CI / CD

| Step | Tool |
|---|---|
| Lint | `ruff check .` |
| Type check | `mypy core/ utils/ models/ scripts/ --ignore-missing-imports` |
| Tests + coverage | `pytest --cov=core --cov=utils` |
| Publish to PyPI | `pypa/gh-action-pypi-publish` on `v*.*.*` tags |

---

## Project Structure

```
OpenIngest/
├── apps/web/                         # Next.js landing page
├── configs/
│   ├── datasets.yaml                 # Dataset registration
│   ├── pipeline.yaml                 # Schedule + notifications
│   └── validation_rules.yaml         # Quality rules per dataset
├── core/
│   ├── connectors/                   # Connector system
│   │   ├── formats/  (csv, excel, json, parquet)
│   │   ├── cloud/    (s3, azure, gcs)
│   │   └── api/      (rest)
│   ├── discovery.py
│   ├── incremental.py
│   ├── ingestion.py
│   ├── lineage.py
│   ├── notifications.py
│   ├── pipeline.py
│   ├── quality.py
│   ├── reporting.py
│   ├── scheduler.py
│   ├── schema.py
│   └── validation.py
├── models/
│   ├── dataset.py
│   └── pipeline_run.py
├── openingest/
│   ├── cli.py                        # Console script entry point
│   └── templates/                    # Project scaffold templates
├── scripts/
│   ├── openingest.py                 # CLI implementation
│   └── commands/
├── utils/
│   ├── config_loader.py
│   ├── db.py
│   └── metadata_logger.py
├── .github/workflows/
│   ├── ci.yml                        # Lint, type check, tests
│   └── publish.yml                   # PyPI publish on version tags
├── docker-compose.yml
└── pyproject.toml
```

---

## Tech Stack

| Category | Technology |
|---|---|
| Language | Python 3.10+ |
| Package | [PyPI — openingest](https://pypi.org/project/openingest/) |
| Database | PostgreSQL 15 |
| Orchestration | Apache Airflow 2.9 |
| Containers | Docker Compose |
| Data Processing | Pandas |
| ORM | SQLAlchemy |
| Configuration | YAML |
| Cloud — AWS | boto3 |
| Cloud — Azure | azure-storage-blob |
| Cloud — GCP | google-cloud-storage |
| Lint | Ruff |
| Type Checking | Mypy |
| Testing | Pytest + pytest-cov |

---

## Milestones

- ✅ v1.0 — Discovery, schema validation, quality engine, incremental loading, Airflow DAG, CLI, CI
- ✅ v2.0 — Excel, JSON, Parquet, S3, Azure Blob, GCS, REST API connectors, plugin registry
- ✅ v2.5 — Built-in scheduler, Slack/email notifications, data lineage engine
- ✅ v2.5.2 — Published to PyPI · `pip install openingest`
- 🔲 v3.0 — Web dashboard, RBAC, multi-environment support, Snowflake/BigQuery connectors

---

## License

MIT — see [LICENSE](LICENSE).

---

**⭐ If OpenIngest saves you time, star the repo.**

[github.com/ManishKudtarkar/OpenIngest](https://github.com/ManishKudtarkar/OpenIngest) · [pypi.org/project/openingest](https://pypi.org/project/openingest/)
