# OpenIngest CLI Reference

All commands are available after `pip install -e .` as `openingest <command>`.

---

## `openingest run`

Run the full ingestion pipeline across all registered datasets.

```bash
openingest run
openingest run --dry-run
openingest run --dataset orders
```

| Flag | Description |
|---|---|
| `--dry-run` | Validate schemas and run quality checks. No data written to the database. |
| `--dataset NAME` | Run a single dataset only. NAME must match a key in `datasets.yaml`. |

**Example output:**

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

## `openingest validate`

Run schema validation across all registered datasets. No data is loaded.

```bash
openingest validate
```

**Example output:**

```
customers    PASS    missing=0  extra=0
orders       PASS    missing=0  extra=0
products     PASS    missing=0  extra=0
sessions     PASS    missing=0  extra=0
employees    PASS    missing=0  extra=0
events       PASS    missing=0  extra=0
order_items  PASS    missing=0  extra=0
reviews      PASS    missing=0  extra=0

All schema validations passed.
```

---

## `openingest quality`

Run data quality checks across all registered datasets. No data is loaded.

```bash
openingest quality
```

**Example output:**

```
Dataset       Quality    Nulls   Dupes   Status
──────────    ────────   ─────   ─────   ──────
customers     100.00%    0       0       PASS
orders         98.50%    3       0       PASS
products      100.00%    0       0       PASS
sessions      100.00%    0       0       PASS
employees     100.00%    0       0       PASS
events         99.20%    8       0       PASS
order_items   100.00%    0       0       PASS
reviews        97.80%    12      4       PASS

Overall Quality Score  →  99.4%
```

---

## `openingest report`

Show the latest pipeline execution report.

```bash
openingest report
```

---

## `openingest history`

Show pipeline and dataset run history from the metadata tables.

```bash
openingest history
openingest history --limit 5
```

| Flag | Description |
|---|---|
| `--limit N` | Number of recent pipeline runs to display. Default: 20. |

**Example output:**

```
Run ID              Timestamp              Rows     Dur    Status
──────────────────  ─────────────────────  ──────   ────   ──────
OI-20260703-3BB09C  2026-07-03 09:42:11    174,777  4.21s  ✓ OK
OI-20260702-A12F4E  2026-07-02 09:38:04    174,230  4.18s  ✓ OK
OI-20260701-9C5E3A  2026-07-01 09:41:38    173,890  4.24s  ✓ OK
```

---

## `openingest dashboard`

Launch the monitoring dashboard in the terminal. Shows pipeline KPIs, dataset health, quality trends, incremental state, and execution history.

```bash
openingest dashboard
```

---

## `openingest scheduler start`

Start the built-in cron scheduler. Runs the full pipeline on a schedule without requiring Apache Airflow.

```bash
openingest scheduler start
openingest scheduler start --cron "0 6 * * *"
openingest scheduler start --cron @daily
openingest scheduler start --cron @hourly --dry-run
```

| Flag | Description |
|---|---|
| `--cron EXPR` | Cron expression or preset. Defaults to schedule in `configs/pipeline.yaml`. |
| `--dry-run` | Runs in dry-run mode on each scheduled tick. |

**Supported presets:**

| Preset | Equivalent cron |
|---|---|
| `@hourly` | `0 * * * *` |
| `@daily` / `@midnight` | `0 0 * * *` |
| `@weekly` | `0 0 * * 0` |
| `@monthly` | `0 0 1 * *` |

Press `Ctrl+C` to stop. Handles `SIGTERM` cleanly.

---

## `openingest schedule`

Set the pipeline schedule in `configs/pipeline.yaml` and patch the Airflow DAG.

```bash
openingest schedule daily
openingest schedule hourly
openingest schedule weekly
openingest schedule monthly
openingest schedule "0 6 * * 1-5"    # weekdays at 6am
```

---

## `openingest infer`

Infer a `datasets.yaml` config block from a CSV file. Detects column names, types, and primary key candidates.

```bash
openingest infer orders.csv
openingest infer data/raw/invoices.csv
```

---

## `openingest profile`

Profile a CSV file and print column statistics: null counts, unique counts, data types, min/max values.

```bash
openingest profile orders.csv
openingest profile data/raw/customers.csv
```

---

## `openingest doctor`

Check the environment: Python version, database connectivity, missing env vars, and package versions.

```bash
openingest doctor
```

---

## `openingest discover`

Scan `data/raw/` for CSV files that are not yet registered in `datasets.yaml` and print suggested config entries.

```bash
openingest discover
```

---

## `openingest init`

Scaffold a new OpenIngest project with the standard directory structure, sample config files, and a sample dataset.

```bash
openingest init my-pipeline
```

Creates:

```
my-pipeline/
├── configs/
│   ├── datasets.yaml
│   ├── pipeline.yaml
│   └── validation_rules.yaml
├── data/
│   └── raw/
├── docker-compose.yml
└── README.md
```

---

## `openingest add-dataset`

Interactive wizard to register a new dataset. Prompts for file path, staging table, load strategy, and key columns.

```bash
openingest add-dataset
```

---

## `openingest version`

Print the installed OpenIngest version.

```bash
openingest version
```

---

## `openingest docker init`

Generate a `docker-compose.yml` for PostgreSQL and Airflow in the current directory.

```bash
openingest docker init
```

---

## `openingest airflow build`

Generate or regenerate the Airflow DAG file from the current `datasets.yaml`.

```bash
openingest airflow build
```

---

## Global notes

- All commands read `DATABASE_URL` from the `.env` file in the project root.
- Run `openingest doctor` first if any command fails — it checks connectivity and environment variables.
- The `--dataset` flag on `run` accepts the exact key name from `datasets.yaml`, not the filename.
