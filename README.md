# OpenIngest

### **Configuration-Driven Data Ingestion Framework with Dynamic Airflow Orchestration**

![Python](https://img.shields.io/badge/Python-3.12-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Airflow](https://img.shields.io/badge/Apache%20Airflow-2.9-red)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![CI](https://github.com/manishkudtarkar/OpenIngest/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-pytest--cov-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

OpenIngest is a production-inspired data ingestion framework that automatically discovers datasets, validates schemas, runs data quality checks, ingests data into PostgreSQL, records execution metadata, and dynamically generates Apache Airflow DAGs — all driven by configuration.

New datasets can be onboarded without writing new ingestion code or new Airflow DAGs.

> **New here?** Start with the [Getting Started guide](docs/GETTING_STARTED.md) — it explains the problem, the mental model, and walks you through adding your first dataset in under 10 minutes.

---

## Architecture

```text
CSV / Raw Files
       |
       v
Dataset Discovery Engine       (core/discovery.py)
       |
       v
Configuration Registration     (configs/datasets.yaml)
       |
       v
Schema Validation Engine       (core/validation.py)
       |
       v
Data Quality Engine            (core/quality.py)
       |
       v
Dynamic Ingestion Engine       (core/ingestion.py)
  - replace
  - append
  - incremental (watermark + hash change detection)
       |
       v
PostgreSQL Staging             (utils/db.py)
       |
       v
Metadata & Audit Logging       (utils/metadata_logger.py)
       |
       v
Execution Report               (core/reporting.py)
       |
       v
Dynamic Airflow Task Factory   (core/airflow/task_factory.py)
       |
       v
Apache Airflow Scheduler
```

---

## Quick Start

**1. Clone and install**

```bash
git clone https://github.com/manishkudtarkar/OpenIngest.git
cd OpenIngest
pip install -e ".[dev]"
```

**2. Configure environment**

```bash
cp .env.example .env
# Set DATABASE_URL=postgresql://user:password@localhost:5432/openingest
```

**3. Start PostgreSQL + Airflow**

```bash
docker compose up -d
```

**4. Run the pipeline**

```bash
openingest run
```

---

## CLI

OpenIngest ships with a full CLI via `openingest`:

```bash
openingest run                        # Run full ingestion pipeline
openingest run --dry-run              # Validate + quality check, no DB writes
openingest run --dataset customers    # Run a single dataset only
openingest validate                   # Schema validation for all datasets
openingest quality                    # Data quality checks for all datasets
openingest report                     # Show latest execution report
openingest history                    # Show pipeline and dataset run history
openingest history --limit 10         # Limit history rows
openingest dashboard                  # Launch monitoring dashboard
```

---

## Configuration

Datasets are registered in `configs/datasets.yaml`. No Python code changes required.

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
  unique_columns:
    - customer_id
  non_null_columns:
    - customer_id
    - email

orders:
  file: orders.csv
  staging_table: stg_orders
  load_strategy: incremental
  incremental_column: order_time
  hash_columns:
    - customer_id
    - subtotal_usd
    - total_usd
  primary_key:
    - order_id
  required_columns:
    - order_id
    - customer_id
    - order_time
    - subtotal_usd
    - total_usd
```

### Load Strategies

| Strategy | Behaviour |
|---|---|
| `replace` | Truncate and reload |
| `append` | Insert new rows |
| `incremental` | Watermark filtering + hash-based change detection + upsert |

---

## Features

### Dataset Discovery
Automatically scans `data/raw/` and converts every CSV into a `Dataset` object.

### Schema Validation
Validates required columns, detects missing and extra columns, checks registration status.

### Data Quality Engine
Configurable rules per dataset:
- `non_null` — no nulls in specified columns
- `unique` — no duplicates in specified columns
- `range` — numeric values within expected bounds

Every run produces a quality score (0–100%) and PASS/FAIL status per dataset.

### Incremental Loading
For `load_strategy: incremental`:
- Filters new rows by watermark column (e.g. `order_time`)
- Detects changed rows via SHA-256 hash of configured columns
- Upserts into PostgreSQL using `ON CONFLICT DO UPDATE`
- Persists watermark state between runs

### Metadata Logging
Every execution records:
- Run ID, status, duration, rows loaded, started/finished timestamps
- Per-dataset: rows loaded, duration, target table, load mode, quality score

### Dynamic Airflow DAG
One DAG (`openingest_dynamic_pipeline`) with one task per registered dataset — generated automatically from config. No DAG modification required when adding datasets.

```text
ingest_customers >> ingest_orders >> ingest_products >> ingest_sessions
```

---

## Project Structure

```text
OpenIngest/
├── configs/
│   ├── datasets.yaml          # Dataset registration
│   ├── pipeline.yaml
│   ├── validation_rules.yaml
│   └── warehouse.yaml
├── core/
│   ├── airflow/
│   │   ├── runner.py
│   │   └── task_factory.py
│   ├── discovery.py
│   ├── incremental.py
│   ├── ingestion.py
│   ├── metadata.py
│   ├── pipeline.py
│   ├── quality.py
│   ├── quality_report.py
│   ├── quality_rules.py
│   ├── reporting.py
│   ├── schema.py
│   ├── validation.py
│   └── warehouse.py
├── dags/
│   └── openingest_dynamic_dag.py
├── data/
│   ├── raw/                   # Source CSV files
│   └── processed/
├── docs/
├── models/
│   ├── dataset.py
│   └── pipeline_run.py
├── scripts/
│   └── openingest.py          # CLI entry point
├── sql/
├── tests/
├── utils/
│   ├── config.py
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

## CI

GitHub Actions runs on every push and pull request to `main`:

| Step | Tool |
|---|---|
| Lint | `ruff check .` |
| Type check | `mypy core/ utils/ models/ scripts/` |
| Tests + coverage | `pytest --cov=core --cov=utils` |

---

## Technologies

| Category | Technology |
|---|---|
| Language | Python 3.12 |
| Database | PostgreSQL 15 |
| Orchestration | Apache Airflow 2.9 |
| Containers | Docker Compose |
| Data Processing | Pandas |
| ORM | SQLAlchemy |
| Configuration | YAML |
| Environment | Python Dotenv |
| Lint | Ruff |
| Type Checking | Mypy |

---

## CI Status

GitHub Actions runs automatically on every push and pull request to `main`.

```text
✓ Ruff        — lint
✓ Mypy        — type check
✓ Pytest      — tests + coverage
✓ GitHub Actions — passing
```

---

## Example Run

The demo pipeline processes **174,777 rows** across 5 datasets in a single run.

```bash
openingest run
```

```text
================================================================================
OPENINGEST
================================================================================
Run ID : OI-20260703-3BB09C
================================================================================

================================================================================
CUSTOMERS
================================================================================
Quality Check : PASS (100.00%)

================================================================================
ORDERS
================================================================================
Quality Check : PASS (98.50%)

================================================================================
PIPELINE SUMMARY
================================================================================
Run ID            : OI-20260703-3BB09C
Datasets Found    : 5
Processed         : 5
Skipped           : 0
Rows Loaded       : 174,777
Duration          : 4.21 sec
Status            : SUCCESS
================================================================================
```

---

## Milestones

- ✅ Milestone 1 — Dataset discovery, config loader, schema validation, PostgreSQL loader
- ✅ Milestone 2 — Metadata logging, pipeline history, reporting engine
- ✅ Milestone 3 — Docker support, Apache Airflow, dynamic DAG generation, task factory
- ✅ Milestone 4 — Automatic schema inference, datatype inference, zero-SQL onboarding
- ✅ Milestone 5 — Data quality engine, incremental loading, CLI, CI/CD

---

## Roadmap

- ✅ Configuration-driven ingestion
- ✅ Dynamic Airflow orchestration
- ✅ Metadata tracking
- ✅ Data quality engine
- ✅ Incremental loading (watermarks + CDC)
- ✅ CLI (`openingest run`, `openingest validate`)
- ✅ GitHub Actions CI (lint, type check, tests)
- 🔲 S3 / Azure Blob / GCS connectors
- 🔲 Excel, JSON, Parquet support
- 🔲 REST API connectors
- 🔲 Scheduling without Airflow (cron mode)
- 🔲 Data lineage visualization
- 🔲 Slack / Email notifications
- 🔲 Plugin architecture for custom connectors
- 🔲 Web dashboard
- 🔲 AI-assisted pipeline generation

---

## Why OpenIngest?

OpenIngest demonstrates modern data engineering practices by combining automated dataset discovery, configuration-driven pipelines, metadata management, data quality enforcement, incremental loading, dynamic Airflow orchestration, and a full CLI — in a single extensible framework.

The project follows production-inspired architecture that can be extended toward enterprise-grade data ingestion solutions.

---

## License

This project is licensed under the **MIT License**.

---

**⭐ If you find OpenIngest useful, consider starring the repository and following its development.**
