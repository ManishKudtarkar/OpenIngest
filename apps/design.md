# OpenIngest — Website Design Specification v2.0

---

## Overview

The OpenIngest website is a modern, developer-first SaaS landing page.

Design inspiration: Vercel, Linear, Supabase, Stripe, Dagster, dbt Labs, Airbyte.

Goal: Within 30 seconds a visitor should understand:
- What OpenIngest is
- What problem it solves
- How it works end to end
- How to install it
- Why it is credible and production-quality

Anti-goals:
- No portfolio feel
- No generic templates
- No excessive animation
- No fake data — every number comes from the real codebase

---

## Real Project Facts (from README + configs)

Product: OpenIngest
Tagline: Configuration-driven Data Ingestion Framework
Secondary: Discover. Validate. Load. Monitor.
Version: 1.0.0
License: MIT
Language: Python 3.12
Database: PostgreSQL 15
Orchestration: Apache Airflow 2.9
CI: GitHub Actions (Ruff, Mypy, Pytest)

Real datasets (8 total):
- customers (replace, 6 required cols)
- orders (incremental, watermark: order_time)
- products (replace)
- sessions (replace)
- employees (replace)
- events (incremental, watermark: timestamp)
- order_items (replace)
- reviews (incremental, watermark: review_time)

Real pipeline run output:
- Run ID: OI-20260703-3BB09C
- Rows loaded: 174,777
- Datasets: 5 processed (demo run)
- Duration: 4.21 sec
- Status: SUCCESS
- Quality: 100% customers, 98.5% orders

Load strategies: replace | append | incremental
Incremental: watermark filtering + SHA-256 hash CDC + ON CONFLICT DO UPDATE

Real CLI commands:
  openingest run
  openingest run --dry-run
  openingest run --dataset customers
  openingest validate
  openingest quality
  openingest report
  openingest history
  openingest history --limit 10
  openingest dashboard

Real DB tables created per run:
  stg_customers, stg_orders, stg_products, stg_sessions, stg_employees
  stg_events, stg_order_items, stg_reviews
  pipeline_runs, pipeline_dataset_runs
  pipeline_quality_runs, pipeline_incremental_state

Real Airflow DAG per dataset (4 tasks per dataset group):
  discover → validate_schema → quality_check → ingest

Real milestones (all completed):
  M1: Discovery, schema validation, PostgreSQL loader
  M2: Metadata logging, pipeline history, reporting
  M3: Docker, Airflow, dynamic DAG generation
  M4: Auto schema inference, zero-SQL onboarding
  M5: Data quality engine, incremental loading, CLI, CI/CD

---

## Brand

Accent:    #4F46E5 (indigo-600)
Dark bg:   #0F172A
Surface:   #1E293B
Surface-2: #334155
Muted:     #64748B
Light:     #F8FAFC
Success:   #22C55E
Warning:   #F59E0B
Danger:    #EF4444

Fonts:
  Headings: Space Grotesk (bold, tight tracking)
  Body:     Inter
  Code:     JetBrains Mono

---

## Page Sections (in order)

1. Navbar
2. Hero
3. Problem / Solution strip
4. Trusted By (tech stack logos)
5. Feature Cards (12 cards in 3-col grid)
6. How It Works — real pipeline architecture diagram
7. Code Example — real datasets.yaml snippet
8. CLI Demo — interactive terminal with real commands
9. Airflow Section — real DAG structure with 8 datasets
10. Load Strategies — explain replace/append/incremental
11. Connectors Section (v2.0) — all source connectors with interactive config preview
12. Stats — 174,777 rows, 4.21s, 8 datasets, 100% quality
13. Roadmap — collapsible v2.0/v2.5/v3.0 with real snippets
14. Getting Started — 5-step install walkthrough
15. Docs cards
16. CTA
17. Footer

---

## Navbar

Logo: ⚡ OpenIngest
Links: Features · Architecture · CLI · Docs · GitHub
Buttons: Get Started · ⭐ Star on GitHub
Behavior: transparent → glass blur on scroll
Mobile: hamburger → slide-down menu

---

## Hero

Heading: "Configuration-driven\nData Ingestion Framework."
Subhead: Real paragraph from README
Badges: Python 3.12 · PostgreSQL 15 · Airflow 2.9 · MIT
Buttons: Get Started → / ⭐ Star on GitHub
Left: Text + badges
Right: Animated terminal showing real openingest run output
Background: dark grid + indigo blob gradients

---

## Architecture Section

Show the real ASCII architecture from README as an animated vertical pipeline.
Each node clickable — reveals description from codebase.

Nodes (in order from README):
1. CSV / Raw Files          → data/raw/ directory
2. Dataset Discovery        → core/discovery.py
3. Config Registration      → configs/datasets.yaml
4. Schema Validation        → core/validation.py
5. Data Quality Engine      → core/quality.py
6. Dynamic Ingestion        → core/ingestion.py (replace/append/incremental)
7. PostgreSQL Staging       → utils/db.py
8. Metadata & Audit         → utils/metadata_logger.py
9. Execution Report         → core/reporting.py
10. Airflow Task Factory    → core/airflow/task_factory.py
11. Apache Airflow          → Scheduler

---

## Code Example

Use the real full dataset config from configs/datasets.yaml — show customers + orders
with all real fields (primary_key, required_columns, unique_columns, non_null_columns,
incremental_column, hash_columns).

This is the most important technical proof that the project is real.

---

## CLI Section

Show real CLI output per command with exact formatting from README:

openingest run → show real run with OI-20260703-3BB09C run ID, 174,777 rows, 4.21s
openingest quality → per-dataset quality scores
openingest report → pipeline summary table
openingest history → table with run IDs
openingest validate → schema validation output
openingest run --dry-run → dry run output
openingest run --dataset orders → single dataset

---

## Airflow Section

Show real DAG: openingest_dynamic_pipeline
8 datasets × 4 tasks = 32 tasks total
Real structure:
  start
  ├── customers [discover → validate_schema → quality_check → ingest]
  ├── orders    [discover → validate_schema → quality_check → ingest]
  ├── products  [discover → validate_schema → quality_check → ingest]
  ├── sessions  [discover → validate_schema → quality_check → ingest]
  ├── employees [discover → validate_schema → quality_check → ingest]
  ├── events    [discover → validate_schema → quality_check → ingest]
  ├── order_items [discover → validate_schema → quality_check → ingest]
  └── reviews   [discover → validate_schema → quality_check → ingest]
  pipeline_report
  end

Schedule: @daily (cron: 0 0 * * *)
Airflow UI: http://localhost:8080

---

## Load Strategies Section

Three cards, each with visual + real example config from datasets.yaml:

replace:     customers, products, sessions, employees, order_items
append:      (future)
incremental: orders (watermark: order_time), events (watermark: timestamp),
             reviews (watermark: review_time)
             Uses: watermark filter + SHA-256 hash CDC + ON CONFLICT DO UPDATE
             State table: pipeline_incremental_state

---

## Stats

Real numbers only:
  174,777   rows loaded per run
  8         datasets registered
  4.21s     pipeline duration
  5         milestones completed
  100%      quality score (customers)
  @daily    Airflow schedule

---

## Getting Started

Real 5-step flow from docs/GETTING_STARTED.md:
1. git clone ...
2. pip install -e ".[dev]"
3. cp .env.example .env → set DATABASE_URL
4. docker compose up -d
5. openingest run

---

## Roadmap

Completed (all 5 milestones):
  M1 Discovery · M2 Metadata · M3 Docker + Airflow · M4 Schema inference · M5 Quality + Incremental + CLI + CI

### Version 2.0 — Multi-format + Cloud (Up Next)

Multi-format Support:
  - Excel (.xlsx) connector
  - JSON connector
  - Parquet connector
  - CSV already done ✅

Cloud Storage Connectors:
  - Amazon S3 connector
  - Azure Blob Storage connector
  - Google Cloud Storage connector

  Config example:
    source:
      type: s3
      bucket: company-data
      key: customers/customers.csv

REST API Connector:
  - GET / POST with headers + auth
  - Bearer token + env var support (${TOKEN})
  - Pagination handling

  Config example:
    source:
      type: rest
      url: https://api.company.com/orders
      method: GET
      headers:
        Authorization: Bearer ${TOKEN}

### Version 2.5 — Scheduling + Observability (Planned)

Cron Mode (no Airflow required):
  - openingest run --schedule "0 * * * *"
  - openingest scheduler start
  - Built-in cron engine

Notifications:
  - Slack webhook on success / fail
  - Email notifications
  - Retry policies

  Config example:
    notifications:
      slack:
        webhook: ${SLACK_URL}

  Example message:
    Pipeline: SUCCESS
    Datasets: 5  Rows: 141,200  Duration: 47 sec

Data Profiling:
  - Automatic dataset profiling
  - Column statistics + distributions

### Version 3.0 — Enterprise Platform (Future)

Plugin Architecture:
  - pip install openingest-s3
  - pip install openingest-snowflake
  - pip install openingest-salesforce
  - ConnectorRegistry.register(...)

  Config example:
    source:
      type: snowflake

Data Lineage Visualization:
  - Visual pipeline lineage graph
  - Source → staging → warehouse flow
  - Dependency tracking

  Example lineage:
    customers.csv → Schema Validation → Quality Checks → stg_customers → warehouse.customers

Enterprise:
  - Web dashboard (Streamlit)
  - RBAC (role-based access control)
  - Multi-environment support
  - PyPI public release

---

## Tech Stack

Next.js 16 · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide React

---

## SEO

Title: OpenIngest | Configuration-driven Data Ingestion Framework
Description: OpenIngest is an open-source Python data ingestion framework.
  Automatic dataset discovery, schema validation, data quality, incremental loading,
  Airflow orchestration, metadata tracking — all driven by YAML configuration.
Keywords: OpenIngest, data engineering, ETL, ELT, Apache Airflow, Python,
  PostgreSQL, data pipeline, open source, schema validation, incremental loading
