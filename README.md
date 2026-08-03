# OpenIngest

### Configuration-Driven Data Ingestion Framework

[![PyPI](https://img.shields.io/pypi/v/openingest?color=indigo&label=PyPI)](https://pypi.org/project/openingest/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://pypi.org/project/openingest/)
[![CI](https://github.com/ManishKudtarkar/OpenIngest/actions/workflows/ci.yml/badge.svg)](https://github.com/ManishKudtarkar/OpenIngest/actions)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Airflow](https://img.shields.io/badge/Apache%20Airflow-2.9-red)](https://airflow.apache.org/)

OpenIngest is a production-grade, configuration-driven data ingestion framework. Register a dataset once in YAML and OpenIngest handles discovery, schema validation, data quality, transformation, PostgreSQL loading, metadata logging, Airflow DAG generation, and notifications — automatically.

**v3.0 ships 21 connectors (databases, cloud, SaaS, FTP/SFTP, REST), a full YAML transformation engine, 93 tests, ruff + mypy clean, and is published on PyPI.**

---

## Install

```bash
pip install openingest
```

Install extras for specific connector types:

```bash
# Cloud storage
pip install openingest[s3]            # Amazon S3
pip install openingest[azure]         # Azure Blob Storage
pip install openingest[gcs]           # Google Cloud Storage

# File formats
pip install openingest[excel]         # Excel (.xlsx / .xls)
pip install openingest[parquet]       # Parquet

# Databases (v3.0)
pip install openingest[mysql]         # MySQL
pip install openingest[mongodb]       # MongoDB
pip install openingest[postgresql]    # PostgreSQL source connector

# File transfer (v3.0)
pip install openingest[sftp]          # SFTP

# SaaS (v3.0)
pip install openingest[salesforce]    # Salesforce
pip install openingest[hubspot]       # HubSpot
pip install openingest[stripe]        # Stripe
pip install openingest[google_sheets] # Google Sheets

# All v3.0 connectors at once
pip install openingest[connectors]

# Everything
pip install openingest[all]
```

---

## Quick Start

```bash
pip install openingest
openingest init my-pipeline
cd my-pipeline
# edit .env → DATABASE_URL=postgresql://...
openingest infer data/raw/orders.csv
openingest run
```

---

## Architecture

```
Source
 CSV · Excel · JSON · Parquet
 S3 · Azure Blob · GCS · REST API
 PostgreSQL · MySQL · MongoDB
 SFTP · FTP
 Salesforce · HubSpot · Stripe · Google Sheets
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
Transformation Engine      core/transform.py   ← NEW in v3.0
  rename · cast · filter · derive · aggregate · python
        │
        ▼
Ingestion Engine           core/ingestion.py
  replace · append · incremental (watermark + SHA-256 CDC + upsert)
        │
        ▼
PostgreSQL Staging         utils/db.py
        │
        ▼
Metadata & Audit Logger    utils/metadata_logger.py
        │
        ▼
Notifications              core/notifications.py  (Slack / Email + retry)
        │
        ▼
Airflow Task Factory       core/airflow/task_factory.py
```

---

## CLI Reference

```bash
openingest run                          # Full pipeline
openingest run --dry-run                # Validate + quality, no DB writes
openingest run --dataset orders         # Single dataset

openingest validate                     # Schema validation for all datasets
openingest quality                      # Quality scores
openingest report                       # Latest execution report
openingest history                      # Full run history
openingest dashboard                    # Monitoring dashboard

openingest infer orders.csv             # Infer datasets.yaml config from CSV
openingest profile orders.csv           # Profile a CSV file
openingest add-dataset                  # Register a dataset interactively
openingest discover                     # Scan data/raw/ for unregistered files

openingest scheduler start              # Built-in cron (no Airflow needed)
openingest scheduler start --cron @daily
openingest scheduler start --cron "0 6 * * *"

openingest airflow build                # Generate Airflow DAG
openingest docker init                  # Generate docker-compose.yml
openingest doctor                       # Check env and DB connectivity
openingest version                      # Show installed version
```

---

## Dataset Configuration

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

### Incremental load

```yaml
orders:
  file: orders.csv
  staging_table: stg_orders
  load_strategy: incremental
  incremental_column: order_time
  primary_key: [order_id]
  hash_columns: [customer_id, total_usd]
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
    port: 5432
    database: ${PG_DATABASE}
    username: ${PG_USER}
    password: ${PG_PASSWORD}
    query: "SELECT * FROM orders WHERE status = 'active'"
  staging_table: stg_pg_orders
  load_strategy: incremental
  incremental_column: updated_at
  primary_key: [order_id]
```

### MySQL source (v3.0)

```yaml
mysql_users:
  source:
    type: mysql
    host: ${MYSQL_HOST}
    database: ${MYSQL_DATABASE}
    username: ${MYSQL_USER}
    password: ${MYSQL_PASSWORD}
    table: users
  staging_table: stg_mysql_users
  load_strategy: replace
```

### MongoDB source (v3.0)

```yaml
mongo_events:
  source:
    type: mongodb
    uri: ${MONGODB_URI}
    database: analytics
    collection: events
    filter: {"status": "active"}
    limit: 50000
  staging_table: stg_mongo_events
  load_strategy: incremental
  incremental_column: created_at
  primary_key: [event_id]
```

### SFTP source (v3.0)

```yaml
sftp_exports:
  source:
    type: sftp
    host: ${SFTP_HOST}
    username: ${SFTP_USER}
    password: ${SFTP_PASSWORD}
    remote_path: /exports/daily_orders.csv
  staging_table: stg_sftp_exports
  load_strategy: replace
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

### HubSpot (v3.0)

```yaml
hs_contacts:
  source:
    type: hubspot
    access_token: ${HUBSPOT_ACCESS_TOKEN}
    object: contacts
    properties: [firstname, lastname, email, createdate]
  staging_table: stg_hs_contacts
  load_strategy: replace
```

### Stripe (v3.0)

```yaml
stripe_charges:
  source:
    type: stripe
    api_key: ${STRIPE_API_KEY}
    resource: charges
    created_after: "2024-01-01T00:00:00"
  staging_table: stg_stripe_charges
  load_strategy: replace
```

### Google Sheets (v3.0)

```yaml
gsheets_budget:
  source:
    type: google_sheets
    spreadsheet_id: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
    sheet_name: Q1_Budget
    service_account_file: ${GOOGLE_SERVICE_ACCOUNT_FILE}
  staging_table: stg_gsheets_budget
  load_strategy: replace
```

---

## Transformations (v3.0)

Apply transform steps after ingestion, before writing to the staging table:

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
        aqi_estimate: "pm25 * 0.5 + no2 * 0.3"

    - type: aggregate
      group_by: [City]
      aggregations:
        pm25: mean
        aqi_estimate: mean

    - type: python
      inline: |
        df["city_upper"] = df["City"].str.upper()
```

Supported transform types: `rename`, `cast`, `filter`, `derive`, `aggregate`, `python`

---

## Connectors

| Source | Type key | Extra |
|---|---|---|
| CSV | `csv` | built-in |
| JSON / NDJSON | `json` | built-in |
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
| **FTP** | `ftp` | built-in (ftplib) |
| **Salesforce** | `salesforce` | `openingest[salesforce]` |
| **HubSpot** | `hubspot` | `openingest[hubspot]` |
| **Stripe** | `stripe` | `openingest[stripe]` |
| **Google Sheets** | `google_sheets` | `openingest[google_sheets]` |

**Bold** = added in v3.0. All connectors use the same plugin architecture — add your own with `ConnectorRegistry.register("my_type", MyConnector)`.

---

## Load Strategies

| Strategy | Behaviour | Use case |
|---|---|---|
| `replace` | Truncate + full reload | Reference tables, catalogs |
| `append` | Insert new rows only | Immutable event logs |
| `incremental` | Watermark + SHA-256 hash CDC + upsert | Orders, transactions, mutable data |

---

## Data Quality Rules

```yaml
# configs/validation_rules.yaml
customers:
  type_checks:
    customer_id: integer
    signup_date: datetime
  range_checks:
    age: {min: 0, max: 120}
  regex_checks:
    email: '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  custom_rules:
    - name: no_placeholder_emails
      condition: "email.str.lower() != 'test@example.com'"
      message: "Email must not be a placeholder"
```

Supported: `type_checks`, `range_checks`, `regex_checks`, `custom_rules`, `non_null_columns`, `unique_columns`, `primary_key`.

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
    retry_count: 3
```

---

## Built-in Scheduler

```bash
openingest scheduler start --cron "0 6 * * *"   # daily at 6am
openingest scheduler start --cron @daily
openingest scheduler start --cron @hourly
```

No Airflow required for basic scheduling.

---

## Airflow DAG

One DAG — `openingest_dynamic_pipeline` — auto-generated from `datasets.yaml`. Each dataset becomes a 4-task group:

```
start
  ├── orders   [discover → validate_schema → quality_check → ingest]
  ├── customers [discover → validate_schema → quality_check → ingest]
  └── products [discover → validate_schema → quality_check → ingest]
        ↓
  pipeline_report → end
```

```bash
openingest airflow build    # generate the DAG file
```

---

## Metadata Tables

| Table | Contents |
|---|---|
| `pipeline_runs` | One row per run — ID, status, duration, rows |
| `pipeline_dataset_runs` | One row per dataset per run — rows, strategy, watermark |
| `pipeline_quality_runs` | Quality scores and check details |
| `pipeline_incremental_state` | Watermark and hash config between runs |

---

## CI / CD

| Step | Tool |
|---|---|
| Lint | `ruff check .` |
| Type check | `mypy core/ utils/ models/ scripts/ --ignore-missing-imports` |
| Tests | `pytest --cov=core --cov=utils` (93 tests) |
| Publish | `pypa/gh-action-pypi-publish` on `v*.*.*` tags |

---

## Project Structure

```
OpenIngest/
├── apps/web/                         # Next.js landing page
├── configs/
│   ├── datasets.yaml                 # Dataset + transform registration
│   ├── pipeline.yaml                 # Schedule + notifications
│   └── validation_rules.yaml         # Quality rules per dataset
├── core/
│   ├── connectors/
│   │   ├── formats/   csv, excel, json, parquet
│   │   ├── cloud/     s3, azure, gcs
│   │   ├── api/       rest
│   │   ├── database/  postgresql, mysql, mongodb   ← v3.0
│   │   ├── transfer/  sftp, ftp                    ← v3.0
│   │   └── saas/      salesforce, hubspot, stripe, google_sheets  ← v3.0
│   ├── transform.py                  ← v3.0 transformation engine
│   ├── discovery.py
│   ├── incremental.py
│   ├── ingestion.py
│   ├── lineage.py
│   ├── notifications.py
│   ├── pipeline.py
│   ├── quality.py
│   ├── scheduler.py
│   └── validation.py
├── models/
├── openingest/
├── scripts/commands/
├── tests/                            # 93 tests
├── utils/
├── .github/workflows/
│   ├── ci.yml
│   └── publish.yml
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
| Data Processing | Pandas |
| ORM | SQLAlchemy |
| Lint | Ruff |
| Type Checking | Mypy |
| Testing | Pytest (93 tests) |

---

## Milestones

- ✅ v1.0 — Discovery, schema validation, quality engine, incremental loading, Airflow DAG, CLI, CI
- ✅ v2.0 — Excel, JSON, Parquet, S3, Azure Blob, GCS, REST API connectors, plugin registry
- ✅ v2.5 — Built-in scheduler, Slack/email notifications with retry, data lineage engine
- ✅ v3.0 — PostgreSQL, MySQL, MongoDB, SFTP, FTP, Salesforce, HubSpot, Stripe, Google Sheets connectors + transformation engine (rename/cast/filter/derive/aggregate/python) + 93 tests + ruff + mypy clean
- ✅ v3.0.1 — Published to PyPI · `pip install openingest`
- 🔲 v4.0 — Web dashboard, RBAC, multi-environment support, Snowflake/BigQuery connectors

---

## License

MIT — see [LICENSE](LICENSE).

---

**⭐ If OpenIngest saves you time, star the repo.**

[github.com/ManishKudtarkar/OpenIngest](https://github.com/ManishKudtarkar/OpenIngest) · [pypi.org/project/openingest](https://pypi.org/project/openingest/)
