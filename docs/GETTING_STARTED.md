# Getting Started with OpenIngest

## What problem does this solve?

Imagine you work at a company. Every day you receive CSV files:

- `customers.csv` — new customer signups
- `orders.csv` — new orders placed
- `products.csv` — product catalog updates

Your job is to load these into a database so analysts can query them.

**Without OpenIngest**, you would write a separate Python script for each file,
manually create database tables, handle errors yourself, and have no visibility
into what ran, when, or how many rows were loaded.

**With OpenIngest**, you register the dataset once in a YAML file. Everything
else — discovery, validation, loading, scheduling, monitoring — happens
automatically.

---

## Who is this for?

| You are | OpenIngest helps you |
|---|---|
| A data engineering student | Understand how real ingestion pipelines are built |
| A junior data engineer | See a working example of config-driven ETL |
| A developer with CSV data | Load it into PostgreSQL without writing SQL |
| Anyone learning Airflow | See a real dynamic DAG with task groups |

---

## The mental model

Think of OpenIngest as a **post office for your data**.

```
Your CSV files  →  OpenIngest  →  PostgreSQL database
```

You don't tell it how to carry each package. You register the address (config)
and it handles the rest.

---

## What happens when you run it?

When you run `openingest run`, this is what happens for every dataset:

```
Step 1 — DISCOVER
  Scans data/raw/ and finds your CSV files

Step 2 — VALIDATE SCHEMA
  Checks that required columns are present
  Fails early if something is missing

Step 3 — QUALITY CHECK
  Checks for nulls, duplicates, out-of-range values
  Gives a quality score (0–100%)
  Stops ingestion if quality fails

Step 4 — INGEST
  Loads data into PostgreSQL using the strategy you configured:
    replace     → wipe and reload
    append      → add new rows
    incremental → only load new/changed rows

Step 5 — METADATA
  Records what ran, how long it took, how many rows loaded

Step 6 — REPORT
  Prints a summary of the full run
```

This is exactly what the Airflow DAG shows visually — each step is a separate
task inside a task group per dataset:

```
start
  ├── customers  [discover → validate_schema → quality_check → ingest]
  ├── orders     [discover → validate_schema → quality_check → ingest]
  ├── products   [discover → validate_schema → quality_check → ingest]
  ├── sessions   [discover → validate_schema → quality_check → ingest]
  └── employees  [discover → validate_schema → quality_check → ingest]
        ↓
  pipeline_report
        ↓
       end
```

---

## Setup in 5 steps

### Step 1 — Clone the repository

```bash
git clone https://github.com/manishkudtarkar/OpenIngest.git
cd OpenIngest
```

### Step 2 — Install the package

```bash
pip install -e ".[dev]"
```

This installs OpenIngest as a local package and gives you the `openingest` CLI.

> **Windows users:** if `openingest` is not recognised after install, add the
> Python Scripts folder to your PATH:
> ```powershell
> $env:PATH += ";C:\Users\<you>\AppData\Roaming\Python\Python312\Scripts"
> ```

### Step 3 — Configure your database

```bash
cp .env.example .env
```

Open `.env` and set your PostgreSQL connection:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/openingest
```

### Step 4 — Start PostgreSQL and Airflow

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port `5432`
- Apache Airflow on `http://localhost:8080` (login: `admin` / `admin`)

### Step 5 — Run the pipeline

```bash
openingest run
```

Expected output:

```
================================================================================
OPENINGEST
================================================================================
Run ID : OI-20260703-3BB09C

CUSTOMERS
Quality Check : PASS (100.00%)

ORDERS
Quality Check : PASS (98.50%)

PIPELINE SUMMARY
Datasets Found    : 5
Processed         : 5
Rows Loaded       : 174,777
Duration          : 4.21 sec
Status            : SUCCESS
================================================================================
```

---

## How to add your own dataset

This is the core feature. You do not write any Python code.

### Step 1 — Drop your CSV into `data/raw/`

```
data/raw/invoices.csv
```

### Step 2 — Register it in `configs/datasets.yaml`

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

### Step 3 — Run

```bash
openingest run --dataset invoices
```

OpenIngest will discover the file, validate the schema, run quality checks,
create the PostgreSQL table automatically, load the data, and record metadata.

No Python written. No SQL written. No DAG edited.

---

## Load strategies explained

### `replace` — full reload every run

```yaml
load_strategy: replace
```

Wipes the table and reloads everything. Use for reference data like products
or lookup tables that are fully replaced each time.

### `append` — add new rows only

```yaml
load_strategy: append
```

Adds rows without touching existing ones. Use for event logs where old records
never change.

### `incremental` — only new and changed rows

```yaml
load_strategy: incremental
incremental_column: order_time
hash_columns:
  - customer_id
  - amount
  - status
```

Every run:
1. Filters rows newer than the last watermark (`order_time`)
2. Detects changed rows via SHA-256 hash of `hash_columns`
3. Upserts into PostgreSQL using `ON CONFLICT DO UPDATE`

Use for orders, transactions, or any dataset where rows are added or updated
over time. The watermark is persisted in `pipeline_incremental_state` so each
run picks up exactly where the last one left off.

---

## CLI reference

```bash
openingest run                      # Run full pipeline
openingest run --dry-run            # Validate + quality check, no DB writes
openingest run --dataset customers  # Run one dataset only
openingest validate                 # Schema validation only
openingest quality                  # Quality checks only
openingest report                   # Latest execution report
openingest history                  # Full run history
openingest history --limit 5        # Last 5 runs
openingest dashboard                # Monitoring dashboard
```

---

## What is in the database after a run?

| Table | What it contains |
|---|---|
| `stg_customers` | Loaded customer data |
| `stg_orders` | Loaded order data |
| `stg_products` | Loaded product data |
| `pipeline_runs` | One row per pipeline execution |
| `pipeline_dataset_runs` | One row per dataset per run |
| `pipeline_quality_runs` | Quality scores per dataset per run |
| `pipeline_incremental_state` | Watermark state for incremental datasets |

---

## What is Airflow doing?

Airflow is the scheduler. Instead of running `openingest run` manually every
day, Airflow runs it automatically on a `@daily` schedule.

Open `http://localhost:8080` to see the DAG graph. Each dataset is a
collapsible task group. Click the `∨` arrow on any group to expand it and see
all four inner tasks: `discover → validate_schema → quality_check → ingest`.

When you add a new dataset to `datasets.yaml`, a new task group appears in the
DAG automatically. No DAG code changes needed.

---

## Common errors and fixes

**`DATABASE_URL not found`**
→ Run `cp .env.example .env` and fill in your database URL.

**`openingest` command not found**
→ Run `pip install -e .` first. On Windows, add the Scripts folder to PATH.

**`Schema validation failed — Missing columns`**
→ Your CSV is missing a column listed in `required_columns`. Fix the CSV or
update the config.

**`Quality check FAILED`**
→ Your data has nulls or duplicates in columns configured as `non_null_columns`
or `unique_columns`. Inspect your CSV.

**`Dataset not found`**
→ The CSV filename must exactly match the `file:` value in `datasets.yaml`.

---

## Next steps

1. Add your own CSV to `data/raw/` and register it in `datasets.yaml`
2. Try `load_strategy: incremental` on a dataset with a timestamp column
3. Open Airflow at `http://localhost:8080` and watch the DAG run
4. Run `openingest report` to see the execution summary
5. Run `openingest dashboard` to see the monitoring dashboard
