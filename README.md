# OpenIngest

**Configuration-driven data ingestion framework for Python.**

[![PyPI](https://img.shields.io/pypi/v/openingest?color=6366F1&label=PyPI&logo=pypi&logoColor=white)](https://pypi.org/project/openingest/)
[![Python](https://img.shields.io/pypi/pyversions/openingest?color=22D3EE&logo=python&logoColor=white)](https://pypi.org/project/openingest/)
[![CI](https://github.com/ManishKudtarkar/OpenIngest/actions/workflows/ci.yml/badge.svg)](https://github.com/ManishKudtarkar/OpenIngest/actions)
[![License](https://img.shields.io/badge/License-MIT-10B981?logo=opensourceinitiative&logoColor=white)](https://github.com/ManishKudtarkar/OpenIngest/blob/main/LICENSE)
[![Tests](https://img.shields.io/badge/tests-93%20passing-10B981)](https://github.com/ManishKudtarkar/OpenIngest/actions)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)

---

OpenIngest is an open-source, production-grade data ingestion framework that replaces hand-written ETL scripts with a single YAML configuration file. Register a dataset once and OpenIngest handles **discovery → schema validation → data quality → transformation → PostgreSQL loading → metadata logging → Airflow DAG generation → notifications** — automatically.

**v3.0 ships 17 connectors, a full YAML transformation engine, 93 tests, and is published on PyPI.**

---

## Install

```bash
pip install openingest
```

Install extras for specific connector types:

```bash
pip install openingest[s3]            # Amazon S3
pip install openingest[azure]         # Azure Blob Storage
pip install openingest[gcs]           # Google Cloud Storage
pip install openingest[mysql]         # MySQL
pip install openingest[mongodb]       # MongoDB
pip install openingest[sftp]          # SFTP
pip install openingest[salesforce]    # Salesforce
pip install openingest[hubspot]       # HubSpot
pip install openingest[stripe]        # Stripe
pip install openingest[google_sheets] # Google Sheets
pip install openingest[connectors]    # All v3.0 connectors
pip install openingest[all]           # Everything
```

---

## Quick Start

```bash
# 1. Install
pip install openingest

# 2. Scaffold a project
openingest init my-pipeline
cd my-pipeline

# 3. Set your database URL in .env
# DATABASE_URL=postgresql://user:password@localhost:5432/openingest

# 4. Start PostgreSQL
docker compose up -d

# 5. Infer config from a CSV and run
openingest infer data/raw/orders.csv
openingest run
```

**Output:**

```
================================================================================
OPENINGEST
================================================================================
Run ID : OI-20260703-3BB09C
================================================================================

================================================================================
ORDERS
================================================================================
Quality Check : PASS (98.50%)

================================================================================
PIPELINE SUMMARY
================================================================================
Run ID            : OI-20260703-3BB09C
Datasets Found    : 3
Processed         : 3
Rows Loaded       : 174,777
Duration          : 4.21 sec
Status            : SUCCESS
================================================================================
```

---

## Dataset Configuration

Everything lives in `configs/datasets.yaml`. No Python required.

### Local CSV

```yaml
customers:
  file: customers.csv
  staging_table: stg_customers
  load_strategy: replace
  primary_key: [customer_id]
  required_columns: [customer_id, name, email]
  non_null_columns: [customer_id, email]
  unique_columns: [customer_id]
```

### Incremental load with CDC

```yaml
orders:
  file: orders.csv
  staging_table: stg_orders
  load_strategy: incremental
  incremental_column: order_time
  primary_key: [order_id]
  hash_columns: [customer_id, total_usd, payment_method]
  required_columns: [order_id, customer_id, order_time, total_usd]
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
```

### PostgreSQL source (v3.0)

```yaml
pg_orders:
  source:
    type: postgresql
    host: ${PG_HOST}
    database: ${PG_DATABASE}
    username: ${PG_USER}
    password: ${PG_PASSWORD}
    query: "SELECT * FROM orders WHERE status = 'active'"
  staging_table: stg_pg_orders
  load_strategy: incremental
  incremental_column: updated_at
  primary_key: [order_id]
```

### Salesforce (v3.0)

```yaml
sf_opportunities:
  source:
    type: salesforce
    username: ${SF_USERNAME}
    password: ${SF_PASSWORD}
    security_token: ${SF_SECURITY_TOKEN}
    client_id: ${SF_CLIENT_ID}
    client_secret: ${SF_CLIENT_SECRET}
    object: Opportunity
    fields: [Id, Name, Amount, StageName, CloseDate]
  staging_table: stg_sf_opportunities
  load_strategy: replace
```

### Transformations (v3.0)

```yaml
air_data:
  source:
    type: s3
    bucket: my-bucket
    key: Air_full-Raw.csv
    aws_access_key_id: ${AWS_ACCESS_KEY_ID}
    aws_secret_access_key: ${AWS_SECRET_ACCESS_KEY}
    region: ap-south-1
  staging_table: stg_air_clean
  load_strategy: replace
  transforms:
    - type: rename
      columns:
        "PM2.5": pm25
        "NO2(GT)": no2
    - type: cast
      columns:
        pm25: float
        no2: float
    - type: filter
      expression: "pm25 >= 0"
    - type: derive
      columns:
        aqi: "pm25 * 0.5 + no2 * 0.3"
    - type: aggregate
      group_by: [City]
      aggregations:
        pm25: mean
        aqi: mean
```

---

## Connectors

| Source | Type key | Install |
|---|---|---|
| CSV | `csv` | built-in |
| JSON / NDJSON | `json` | built-in |
| FTP | `ftp` | built-in |
| Excel | `excel` | `openingest[excel]` |
| Parquet | `parquet` | `openingest[parquet]` |
| Amazon S3 | `s3` | `openingest[s3]` |
| Azure Blob | `azure` | `openingest[azure]` |
| Google Cloud Storage | `gcs` | `openingest[gcs]` |
| REST API | `rest` | `openingest[api]` |
| **PostgreSQL** | `postgresql` | `openingest[postgresql]` |
| **MySQL** | `mysql` | `openingest[mysql]` |
| **MongoDB** | `mongodb` | `openingest[mongodb]` |
| **SFTP** | `sftp` | `openingest[sftp]` |
| **Salesforce** | `salesforce` | `openingest[salesforce]` |
| **HubSpot** | `hubspot` | `openingest[hubspot]` |
| **Stripe** | `stripe` | `openingest[stripe]` |
| **Google Sheets** | `google_sheets` | `openingest[google_sheets]` |

**Bold** = added in v3.0. Add your own connector:

```python
from core.connectors.registry import ConnectorRegistry
ConnectorRegistry.register("my_db", MyDatabaseConnector)
```

---

## Load Strategies

| Strategy | Behaviour | Use case |
|---|---|---|
| `replace` | Truncate + full reload every run | Reference tables, product catalogs |
| `append` | Insert new rows only | Immutable event logs |
| `incremental` | Watermark filter + SHA-256 hash CDC + upsert | Orders, transactions, mutable data |

---

## Transformations

Six declarative transform types run after quality checks, before the DB write:

| Type | What it does |
|---|---|
| `rename` | Rename columns |
| `cast` | Cast column types (`int`, `float`, `str`, `bool`, `date`, `datetime`) |
| `filter` | Filter rows via `df.query()` expression |
| `derive` | Add computed columns via `df.eval()` expression |
| `aggregate` | Group-by aggregations (`sum`, `mean`, `min`, `max`, `count`) |
| `python` | Call a Python function by dotted path or inline code |

---

## CLI Reference

```bash
openingest run                       # Full pipeline
openingest run --dry-run             # Validate + quality, no DB writes
openingest run --dataset orders      # Single dataset

openingest validate                  # Schema validation
openingest quality                   # Quality scores
openingest report                    # Latest run report
openingest history                   # Run history
openingest dashboard                 # Monitoring dashboard

openingest infer orders.csv          # Infer datasets.yaml from CSV
openingest profile orders.csv        # Profile a CSV

openingest scheduler start --cron @daily
openingest scheduler start --cron "0 6 * * *"

openingest airflow build             # Generate Airflow DAG
openingest docker init               # Generate docker-compose.yml
openingest doctor                    # Check environment
openingest version                   # Show version
```

---

## Pipeline Flow

```
Source (CSV · Excel · JSON · Parquet · S3 · Azure · GCS · REST · PostgreSQL · MySQL · MongoDB · SFTP · FTP · Salesforce · HubSpot · Stripe · Google Sheets)
    │
    ▼  Dataset Discovery         core/discovery.py
    ▼  Schema Validation         core/validation.py
    ▼  Data Quality Engine       core/quality.py
    ▼  Transformation Engine     core/transform.py   ← v3.0
    ▼  Ingestion Engine          core/ingestion.py
    ▼  PostgreSQL Staging        auto-created tables
    ▼  Metadata Logger           pipeline_runs · pipeline_dataset_runs
    ▼  Notifications             Slack + Email with retry
    ▼  Airflow DAG               openingest_dynamic_pipeline
```

---

## Notifications

```yaml
# configs/pipeline.yaml
notifications:
  slack:
    webhook: ${SLACK_WEBHOOK_URL}
    on: [success, failure]
    retry_count: 3
  email:
    smtp_host: smtp.company.com
    smtp_port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
    to: [data-team@company.com]
    on: [failure]
```

---

## CI / CD

| Step | Tool |
|---|---|
| Lint | `ruff check .` |
| Type check | `mypy core/ utils/ models/ scripts/ --ignore-missing-imports` |
| Tests | `pytest` (93 tests) |
| Publish | `pypa/gh-action-pypi-publish` on `v*.*.*` tags |

---

## Links

- **Homepage:** https://open-ingest.vercel.app
- **Repository:** https://github.com/ManishKudtarkar/OpenIngest
- **Issues:** https://github.com/ManishKudtarkar/OpenIngest/issues
- **Changelog:** https://github.com/ManishKudtarkar/OpenIngest/releases
- **PyPI:** https://pypi.org/project/openingest/

---

## Milestones

- ✅ v1.0 — Discovery, schema validation, quality engine, incremental loading, Airflow DAG, CLI, CI
- ✅ v2.0 — Excel, JSON, Parquet, S3, Azure Blob, GCS, REST API connectors, plugin registry
- ✅ v2.5 — Built-in scheduler, Slack/email notifications with retry, data lineage engine
- ✅ v3.0 — PostgreSQL, MySQL, MongoDB, SFTP, FTP, Salesforce, HubSpot, Stripe, Google Sheets + transformation engine + 93 tests
- ✅ v3.0.3 — PyPI · `pip install openingest`
- 🔲 v4.0 — Web dashboard, RBAC, multi-environment support, Snowflake/BigQuery connectors

---

## License

MIT — see [LICENSE](https://github.com/ManishKudtarkar/OpenIngest/blob/main/LICENSE)

---

*⭐ If OpenIngest saves you time, star the repo at [github.com/ManishKudtarkar/OpenIngest](https://github.com/ManishKudtarkar/OpenIngest)*
