# OpenIngest

### Configuration-Driven Data Ingestion Framework

![Python](https://img.shields.io/badge/Python-3.12-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Airflow](https://img.shields.io/badge/Apache%20Airflow-2.9-red)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![CI](https://github.com/ManishKudtarkar/OpenIngest/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/version-2.0.0-indigo)

OpenIngest is a production-grade, configuration-driven data ingestion framework. Register a dataset once in YAML and OpenIngest handles discovery, schema validation, data quality, PostgreSQL loading, metadata logging, Airflow DAG generation, and notifications — automatically.

**v2.0 ships connectors for Amazon S3, Azure Blob, Google Cloud Storage, REST APIs, Excel, JSON, and Parquet in addition to the original CSV support.**

> New here? Read the [Getting Started guide](docs/GETTING_STARTED.md) — from clone to 174,777 rows loaded in under 10 minutes.

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
  ├── replace   (truncate + reload)
  ├── append    (insert new rows)
  └── incremental (watermark + SHA-256 hash CDC + upsert)
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

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/ManishKudtarkar/OpenIngest.git
cd OpenIngest
pip install -e ".[dev]"

# 2. Configure database
cp .env.example .env
# Set DATABASE_URL=postgresql://user:password@localhost:5432/openingest

# 3. Start PostgreSQL + Airflow
docker compose up -d

# 4. Run the pipeline
openingest run
```

Expected output:

```
══════════════════════════════════════
OPENINGEST  ·  OI-20260703-3BB09C
══════════════════════════════════════

  ✓  customers    →  stg_customers    replace       100.00%
  ✓  orders       →  stg_orders       incremental    98.50%
  ✓  products     →  stg_products     replace       100.00%
  ✓  sessions     →  stg_sessions     replace       100.00%
  ✓  employees    →  stg_employees    replace       100.00%
  ✓  events       →  stg_events       incremental    99.20%
  ✓  order_items  →  stg_order_items  replace       100.00%
  ✓  reviews      →  stg_reviews      incremental    97.80%

  Run ID      :  OI-20260703-3BB09C
  Datasets    :  8
  Rows Loaded :  174,777
  Duration    :  4.21 sec
  Status      :  SUCCESS ✓
══════════════════════════════════════
```

---

## CLI

```bash
openingest run                          # Full pipeline, all datasets
openingest run --dry-run                # Validate + quality check, no DB writes
openingest run --dataset orders         # Single dataset only
openingest validate                     # Schema validation for all datasets
openingest quality                      # Quality scores for all datasets
openingest report                       # Latest execution report
openingest history                      # Full run history
openingest history --limit 10           # Last 10 runs
openingest dashboard                    # Monitoring dashboard
openingest scheduler start              # Built-in cron scheduler (no Airflow needed)
openingest scheduler start --cron @daily
openingest schedule daily               # Set Airflow + pipeline schedule
openingest infer orders.csv             # Infer datasets.yaml config from a CSV
openingest profile orders.csv           # Profile a CSV file
openingest doctor                       # Check environment and DB connectivity
openingest init my-project              # Scaffold a new OpenIngest project
```

---

## Dataset Configuration

All datasets are registered in `configs/datasets.yaml`. No Python code required.

### Local file (CSV)

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
    - country
    - age
    - signup_date
  unique_columns:
    - customer_id
  non_null_columns:
    - customer_id
    - email
```

### Incremental dataset

```yaml
orders:
  file: orders.csv
  staging_table: stg_orders
  load_strategy: incremental
  incremental_column: order_time
  hash_columns:
    - customer_id
    - subtotal_usd
    - total_usd
    - payment_method
  primary_key:
    - order_id
  required_columns:
    - order_id
    - customer_id
    - order_time
    - subtotal_usd
    - total_usd
```

### Amazon S3 source (v2.0)

```yaml
orders_s3:
  source:
    type: s3
    bucket: company-data
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

### Azure Blob Storage source (v2.0)

```yaml
products_azure:
  source:
    type: azure
    container: company-data
    blob: products/products.parquet
    connection_string: ${AZURE_STORAGE_CONNECTION_STRING}
  staging_table: stg_products
  load_strategy: replace
  primary_key: [product_id]
  required_columns: [product_id, name, price_usd]
```

### Google Cloud Storage source (v2.0)

```yaml
events_gcs:
  source:
    type: gcs
    bucket: company-data
    object: events/events.csv
    project: my-gcp-project
  staging_table: stg_events
  load_strategy: incremental
  incremental_column: timestamp
  primary_key: [event_id]
  required_columns: [event_id, session_id, timestamp, event_type]
```

### REST API source (v2.0)

```yaml
api_orders:
  source:
    type: rest
    url: https://api.company.com/v1/orders
    method: GET
    headers:
      Authorization: Bearer ${ORDERS_API_TOKEN}
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

### Excel source (v2.0)

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

### Parquet source (v2.0)

```yaml
events_parquet:
  source:
    type: parquet
    file: data/raw/events.parquet
    columns: [event_id, session_id, timestamp, event_type, amount_usd]
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
| `replace` | Truncate + full reload | Reference tables, product catalogs |
| `append` | Insert new rows only | Immutable event logs |
| `incremental` | Watermark filter + SHA-256 hash CDC + upsert | Orders, transactions, any mutable time-series |

---

## Connectors (v2.0)

| Type | Config `type:` | Install |
|---|---|---|
| CSV | `csv` | Built-in |
| Excel | `excel` | `pip install openingest[excel]` |
| JSON / NDJSON | `json` | Built-in |
| Parquet | `parquet` | `pip install openingest[parquet]` |
| Amazon S3 | `s3` | `pip install openingest[s3]` |
| Azure Blob | `azure` | `pip install openingest[azure]` |
| Google Cloud Storage | `gcs` | `pip install openingest[gcs]` |
| REST API | `rest` | `pip install openingest[api]` |

Install all v2.0 connectors at once:

```bash
pip install openingest[v2]
```

---

## Data Quality Rules

Quality rules are defined in `configs/validation_rules.yaml` per dataset:

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

Supported rule types: `type_checks`, `range_checks`, `regex_checks`, `custom_rules`, `non_null`, `unique`, `primary_key`.

---

## Notifications (v2.5)

Configure Slack and email alerts in `configs/pipeline.yaml`:

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

## Built-in Scheduler (v2.5)

Run the pipeline on a cron schedule without Airflow:

```bash
openingest scheduler start --cron "0 6 * * *"
openingest scheduler start --cron @daily
openingest scheduler start --cron @hourly
```

---

## Plugin Architecture (v3.0)

Third-party connectors register themselves via `ConnectorRegistry`:

```bash
pip install openingest-snowflake
pip install openingest-salesforce
```

```python
from core.connectors.registry import ConnectorRegistry

ConnectorRegistry.register("snowflake", SnowflakeConnector)
```

Then use in YAML:

```yaml
source:
  type: snowflake
  account: myaccount
  warehouse: COMPUTE_WH
  database: RAW
  schema: PUBLIC
  table: orders
```

---

## Data Lineage (v3.0)

```python
from core.lineage import LineageGraph

graph = LineageGraph()
graph.add_dataset_lineage(dataset)

graph.print_ascii()    # terminal tree view
graph.to_mermaid()     # Mermaid diagram syntax
graph.to_dict()        # JSON for web UI
```

ASCII output:

```
  customers
  ├─ customers.csv
  │
  ├─ Dataset Discovery
  │
  ├─ Schema Validation  [PASS]
  │
  ├─ Quality Engine  [PASS]  100.0%
  │
  ├─ Ingest (replace)  174,777 rows
  │
  └─ stg_customers
```

---

## Project Structure

```
OpenIngest/
├── apps/
│   └── web/                          # Next.js landing page
├── configs/
│   ├── datasets.yaml                 # Dataset registration + source config
│   ├── pipeline.yaml                 # Schedule + notification config
│   ├── validation_rules.yaml         # Quality rules per dataset
│   └── warehouse.yaml
├── core/
│   ├── airflow/
│   │   ├── runner.py                 # Airflow task callables
│   │   └── task_factory.py           # PythonOperator factory
│   ├── connectors/                   # v2.0 connector system
│   │   ├── base.py                   # BaseConnector ABC
│   │   ├── registry.py               # ConnectorRegistry
│   │   ├── formats/
│   │   │   ├── csv_connector.py
│   │   │   ├── excel_connector.py
│   │   │   ├── json_connector.py
│   │   │   └── parquet_connector.py
│   │   ├── cloud/
│   │   │   ├── s3_connector.py
│   │   │   ├── azure_connector.py
│   │   │   └── gcs_connector.py
│   │   └── api/
│   │       └── rest_connector.py
│   ├── discovery.py
│   ├── incremental.py
│   ├── ingestion.py
│   ├── lineage.py                    # v3.0 data lineage tracker
│   ├── metadata.py
│   ├── notifications.py              # v2.5 Slack + email
│   ├── observability.py
│   ├── pipeline.py
│   ├── quality.py
│   ├── quality_report.py
│   ├── quality_rules.py
│   ├── reporting.py
│   ├── scheduler.py                  # v2.5 built-in cron scheduler
│   ├── schema.py
│   ├── validation.py
│   └── warehouse.py
├── dags/
│   └── openingest_dynamic_dag.py     # Auto-generated Airflow DAG
├── data/
│   ├── raw/                          # Source files land here
│   └── processed/
├── docs/
│   ├── GETTING_STARTED.md
│   ├── CONNECTORS.md
│   └── CLI_REFERENCE.md
├── models/
│   ├── dataset.py
│   └── pipeline_run.py
├── scripts/
│   ├── openingest.py                 # CLI entry point
│   └── commands/
├── tests/
├── utils/
│   ├── config_loader.py
│   ├── db.py
│   ├── logger.py
│   └── metadata_logger.py
├── .github/workflows/ci.yml
├── docker-compose.yml
├── pyproject.toml
└── requirements.txt
```

---

## Metadata Tables

| Table | Contents |
|---|---|
| `pipeline_runs` | One row per pipeline execution — run ID, status, duration, rows, timestamps |
| `pipeline_dataset_runs` | One row per dataset per run — rows loaded, duration, strategy, load mode, watermark |
| `pipeline_quality_runs` | Quality scores and check results per dataset per run |
| `pipeline_incremental_state` | Watermark + hash config persisted between runs |

---

## Airflow DAG

One DAG — `openingest_dynamic_pipeline` — generated from `datasets.yaml` at parse time. Each registered dataset becomes a 4-task group:

```
start
  ├── customers   [discover → validate_schema → quality_check → ingest]
  ├── orders      [discover → validate_schema → quality_check → ingest]
  ├── products    [discover → validate_schema → quality_check → ingest]
  ├── sessions    [discover → validate_schema → quality_check → ingest]
  ├── employees   [discover → validate_schema → quality_check → ingest]
  ├── events      [discover → validate_schema → quality_check → ingest]
  ├── order_items [discover → validate_schema → quality_check → ingest]
  └── reviews     [discover → validate_schema → quality_check → ingest]
        ↓
  pipeline_report
        ↓
       end
```

Schedule: `@daily` · Retries: 2 · UI: `http://localhost:8080`

Add a dataset to `datasets.yaml` → task group appears automatically. No DAG edits.

---

## CI

GitHub Actions runs on every push and PR to `main`:

| Step | Tool |
|---|---|
| Lint | `ruff check .` |
| Type check | `mypy core/ utils/ models/ scripts/ --ignore-missing-imports` |
| Tests + coverage | `pytest --cov=core --cov=utils` |

---

## Tech Stack

| Category | Technology |
|---|---|
| Language | Python 3.12 |
| Database | PostgreSQL 15 |
| Orchestration | Apache Airflow 2.9 |
| Containers | Docker Compose |
| Data Processing | Pandas |
| ORM | SQLAlchemy |
| Configuration | YAML |
| Cloud — AWS | boto3 |
| Cloud — Azure | azure-storage-blob |
| Cloud — GCP | google-cloud-storage |
| HTTP | requests |
| Lint | Ruff |
| Type Checking | Mypy |
| Testing | Pytest + pytest-cov |

---

## Milestones

- ✅ v1.0 — Discovery, schema validation, quality engine, incremental loading, Airflow DAG, CLI, CI/CD
- ✅ v2.0 — Excel, JSON, Parquet, S3, Azure Blob, GCS, REST API connectors, plugin registry
- ✅ v2.5 — Built-in cron scheduler, Slack notifications, email notifications, data lineage engine
- 🔲 v3.0 — Web dashboard, RBAC, multi-environment support, dataset profiling, PyPI release

---

## License

MIT — see [LICENSE](LICENSE).

---

**⭐ If OpenIngest is useful, star the repo and share it with your team.**

[github.com/ManishKudtarkar/OpenIngest](https://github.com/ManishKudtarkar/OpenIngest)
