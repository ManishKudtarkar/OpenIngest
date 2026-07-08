# Getting Started with OpenIngest

From clone to **174,777 rows loaded in 4.21 seconds** — in under 10 minutes.

---

## What is OpenIngest?

OpenIngest is a configuration-driven data ingestion framework. You register a dataset in a YAML file. OpenIngest handles everything else: file discovery, schema validation, data quality checks, PostgreSQL loading, metadata logging, and Airflow DAG generation.

No Python per dataset. No SQL DDL. No DAG edits.

---

## Prerequisites

- Python 3.10+
- Docker Desktop (for PostgreSQL + Airflow)
- Git

---

## Step 1 — Clone and install

```bash
git clone https://github.com/ManishKudtarkar/OpenIngest.git
cd OpenIngest
pip install -e ".[dev]"
```

This installs OpenIngest as an editable package and registers the `openingest` CLI.

**Windows — if `openingest` command is not found after install:**

```powershell
$env:PATH += ";C:\Users\<you>\AppData\Roaming\Python\Python312\Scripts"
```

Verify the install:

```bash
openingest --help
```

---

## Step 2 — Configure the database

```bash
cp .env.example .env
```

Open `.env` and set your PostgreSQL connection string:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/openingest
```

---

## Step 3 — Start PostgreSQL and Airflow

```bash
docker compose up -d
```

This starts:

| Service | URL / Port |
|---|---|
| PostgreSQL | `localhost:5432` |
| Apache Airflow | `http://localhost:8080` (admin / admin) |

Wait ~30 seconds for Airflow to initialise on first start.

---

## Step 4 — Run the pipeline

```bash
openingest run
```

OpenIngest will:
1. Discover all 8 registered datasets
2. Validate schemas
3. Run data quality checks
4. Create staging tables automatically (no SQL needed)
5. Load data using the configured strategy
6. Log metadata to PostgreSQL
7. Print the execution report

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

## Step 5 — Explore the CLI

```bash
openingest validate              # Schema-only check, no data loaded
openingest quality               # Quality scores per dataset
openingest report                # Latest execution summary
openingest history --limit 5     # Last 5 pipeline runs
openingest dashboard             # Full monitoring view
openingest run --dry-run         # Validate + quality, zero DB writes
openingest run --dataset orders  # Run a single dataset only
```

---

## How to add your own dataset

This is the core feature. You do not write Python.

### 1. Drop your file into `data/raw/`

```
data/raw/invoices.csv
```

### 2. Register it in `configs/datasets.yaml`

```yaml
invoices:
  file: invoices.csv
  staging_table: stg_invoices
  load_strategy: replace
  primary_key:
    - invoice_id
  required_columns:
    - invoice_id
    - customer_id
    - amount
    - invoice_date
  non_null_columns:
    - invoice_id
    - amount
```

### 3. Run

```bash
openingest run --dataset invoices
```

OpenIngest discovers the file, validates the schema, runs quality checks, creates the PostgreSQL table, loads the data, and records metadata. Zero SQL written. Zero Python written. Zero DAG edited.

---

## Using cloud sources (v2.0)

You can source data from S3, Azure Blob, GCS, or any REST API instead of local files. Add a `source:` block to the dataset config:

### Amazon S3

```bash
pip install openingest[s3]
```

```yaml
customers_cloud:
  source:
    type: s3
    bucket: my-data-bucket
    key: customers/customers.csv
    region: us-east-1
    aws_access_key_id: ${AWS_ACCESS_KEY_ID}
    aws_secret_access_key: ${AWS_SECRET_ACCESS_KEY}
  staging_table: stg_customers
  load_strategy: replace
  primary_key: [customer_id]
  required_columns: [customer_id, name, email]
```

### REST API

```bash
pip install openingest[api]
```

```yaml
stripe_charges:
  source:
    type: rest
    url: https://api.stripe.com/v1/charges
    method: GET
    headers:
      Authorization: Bearer ${STRIPE_API_KEY}
    record_path: data
    pagination:
      type: cursor
      cursor_path: has_more
      param: starting_after
      max_pages: 100
  staging_table: stg_stripe_charges
  load_strategy: incremental
  incremental_column: created
  primary_key: [id]
  required_columns: [id, amount, currency, created]
```

See [CONNECTORS.md](CONNECTORS.md) for full documentation on all 9 connectors.

---

## Load strategies

### `replace` — full reload every run

```yaml
load_strategy: replace
```

Truncates the staging table and reloads all rows. Use for reference data — product catalogs, employee lists, lookup tables — where the full dataset fits in one load.

### `append` — new rows only

```yaml
load_strategy: append
```

Inserts rows without modifying existing records. Use for immutable event logs where historical records never change.

### `incremental` — only new and changed rows

```yaml
load_strategy: incremental
incremental_column: order_time
hash_columns:
  - customer_id
  - subtotal_usd
  - total_usd
  - payment_method
```

On each run:
1. Filters rows newer than the last recorded watermark (`order_time`)
2. Detects rows that changed via SHA-256 hash of `hash_columns`
3. Upserts using `ON CONFLICT DO UPDATE`
4. Saves the new watermark to `pipeline_incremental_state`

The watermark survives restarts and Airflow pod recycling.

---

## What is in PostgreSQL after a run?

| Table | Contents |
|---|---|
| `stg_customers` | Loaded customer data |
| `stg_orders` | Loaded order data |
| `stg_products` | Loaded product data |
| `stg_sessions` | Loaded session data |
| `stg_employees` | Loaded employee data |
| `stg_events` | Loaded event data |
| `stg_order_items` | Loaded order item data |
| `stg_reviews` | Loaded review data |
| `pipeline_runs` | One row per pipeline execution |
| `pipeline_dataset_runs` | One row per dataset per run |
| `pipeline_quality_runs` | Quality scores per dataset per run |
| `pipeline_incremental_state` | Watermark + hash config per incremental dataset |

---

## Data quality rules

Add quality checks in `configs/validation_rules.yaml`:

```yaml
customers:
  type_checks:
    customer_id: integer
    age: integer
    email: string
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

Supported rule types:

| Rule | What it checks |
|---|---|
| `type_checks` | Column values match declared type |
| `range_checks` | Numeric values within min/max bounds |
| `regex_checks` | String values match a regex pattern |
| `custom_rules` | Arbitrary boolean `pandas.DataFrame.eval()` expressions |
| `non_null_columns` (in datasets.yaml) | No null values |
| `unique_columns` (in datasets.yaml) | No duplicate values |
| `primary_key` (in datasets.yaml) | Not null + unique combined |

---

## Notifications (v2.5)

Configure in `configs/pipeline.yaml`:

```yaml
notifications:
  slack:
    webhook: ${SLACK_WEBHOOK_URL}
    on: [success, failure]
  email:
    smtp_host: smtp.gmail.com
    smtp_port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
    to:
      - data-team@company.com
    on: [failure]
```

Slack message on success:

```
✅ OpenIngest — Pipeline SUCCESS
Run ID   : OI-20260703-3BB09C
Datasets : 8
Rows     : 174,777
Duration : 4.21s
```

---

## Built-in scheduler — no Airflow needed (v2.5)

```bash
openingest scheduler start --cron "0 6 * * *"   # every day at 6am
openingest scheduler start --cron @daily
openingest scheduler start --cron @hourly
```

The scheduler fires once per matching cron minute, handles SIGTERM cleanly, and supports all standard 5-field cron expressions plus presets (`@daily`, `@hourly`, `@weekly`, `@monthly`).

---

## Airflow

Airflow is the production scheduler. The DAG `openingest_dynamic_pipeline` is generated automatically from `datasets.yaml`.

Open `http://localhost:8080` to see the DAG. Each dataset is a collapsible task group — click to expand and see `discover → validate_schema → quality_check → ingest`.

**Adding a new dataset**: update `datasets.yaml`, restart the Airflow scheduler, and the new task group appears automatically. No DAG edits.

---

## Common errors

| Error | Fix |
|---|---|
| `DATABASE_URL not found` | Run `cp .env.example .env` and set `DATABASE_URL` |
| `openingest` command not found | Run `pip install -e .`, then check PATH (Windows) |
| `Schema validation failed — Missing columns` | CSV is missing a column in `required_columns` — fix CSV or update config |
| `Quality check FAILED` | Data has nulls or duplicates in constrained columns — inspect source |
| `Dataset not found` | CSV filename must exactly match the `file:` value in datasets.yaml |
| `No connector for type 's3'` | Run `pip install openingest[s3]` |

---

## Next steps

1. Add your own CSV to `data/raw/` and register it in `datasets.yaml`
2. Try `load_strategy: incremental` on any dataset with a timestamp column
3. Add a cloud source (`type: s3`, `type: rest`) to an existing dataset
4. Open Airflow at `http://localhost:8080` and watch the DAG run
5. Run `openingest dashboard` to see the monitoring view
6. Set up Slack notifications for pipeline failures
