# OpenIngest — Usability and Observability

This document covers the monitoring, metadata, and notification capabilities of OpenIngest.

---

## Metadata tables

Every pipeline execution writes to four PostgreSQL tables automatically created on first run.

### `pipeline_runs`

One row per full pipeline execution.

| Column | Type | Description |
|---|---|---|
| `run_id` | TEXT | Unique ID — format `OI-YYYYMMDD-XXXXXX` |
| `status` | TEXT | `SUCCESS` or `FAILED` |
| `total_datasets` | INTEGER | Datasets processed |
| `total_rows` | BIGINT | Total rows loaded |
| `total_duration` | FLOAT | Seconds |
| `started_at` | TIMESTAMP | Run start time |
| `finished_at` | TIMESTAMP | Run finish time |

### `pipeline_dataset_runs`

One row per dataset per execution.

| Column | Type | Description |
|---|---|---|
| `run_id` | TEXT | Foreign key to `pipeline_runs` |
| `dataset_name` | TEXT | Dataset name from `datasets.yaml` |
| `status` | TEXT | `SUCCESS` or `FAILED` |
| `rows_loaded` | BIGINT | Rows loaded this run |
| `duration_seconds` | FLOAT | Seconds |
| `target_table` | TEXT | Staging table name |
| `load_strategy` | TEXT | `replace`, `append`, or `incremental` |
| `load_mode` | TEXT | `FULL`, `APPEND`, or `INCREMENTAL` |
| `watermark_value` | TEXT | Latest watermark (incremental only) |
| `loaded_at` | TIMESTAMP | Completion timestamp |

### `pipeline_quality_runs`

One row per dataset per execution with quality metrics.

| Column | Type | Description |
|---|---|---|
| `run_id` | TEXT | Foreign key to `pipeline_runs` |
| `dataset_name` | TEXT | Dataset name |
| `status` | TEXT | `PASS` or `FAIL` |
| `score` | FLOAT | Quality score 0.0–100.0 |
| `checks_total` | INTEGER | Total checks run |
| `checks_passed` | INTEGER | Checks that passed |
| `checks_failed` | INTEGER | Checks that failed |

### `pipeline_incremental_state`

Persists watermark state between runs for incremental datasets.

| Column | Type | Description |
|---|---|---|
| `dataset_name` | TEXT | Primary key |
| `target_table` | TEXT | Staging table |
| `incremental_column` | TEXT | Watermark column name |
| `last_watermark_value` | TEXT | Last processed watermark |
| `last_rows_loaded` | BIGINT | Rows loaded on last run |
| `last_source_rows` | BIGINT | Total source rows on last run |
| `last_loaded_at` | TIMESTAMP | Timestamp of last successful run |

---

## CLI monitoring commands

```bash
# Latest execution report — one-line summary per dataset
openingest report

# Full run history
openingest history
openingest history --limit 10

# Full monitoring dashboard — KPIs, dataset health, quality trends
openingest dashboard
```

The dashboard shows:
- Pipeline KPIs (latest run status, total rows, quality score, duration)
- Dataset health snapshot (per-dataset rows, quality, watermark)
- Dataset-level trends across the last 20 runs
- Incremental loading statistics (new records, skipped, latest watermark)
- Quality distribution (PASS / FAIL counts)
- Slowest datasets by average duration

---

## Notifications (v2.5)

Configure in `configs/pipeline.yaml`:

```yaml
notifications:
  slack:
    webhook: ${SLACK_WEBHOOK_URL}
    on: [success, failure]      # which events trigger a notification

  email:
    smtp_host: smtp.gmail.com
    smtp_port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
    from: openingest@company.com
    to:
      - data-team@company.com
      - oncall@company.com
    on: [failure]               # only alert on failure
```

Both channels support `on: [success]`, `on: [failure]`, or `on: [success, failure]` independently.

### Slack message format

Uses Slack Block Kit. Example success notification:

```
✅ OpenIngest — Pipeline SUCCESS

Run ID   : OI-20260703-3BB09C
Status   : SUCCESS
Datasets : 8
Rows     : 174,777
Duration : 4.21s
```

### Email format

Plain-text email via SMTP. Subject line:

```
✅ OpenIngest Pipeline: SUCCESS — OI-20260703-3BB09C
```

---

## Data lineage (v3.0)

The lineage engine builds a directed graph of how data flows through the pipeline per dataset.

```python
from core.lineage import LineageGraph

graph = LineageGraph()

# Build lineage for all datasets after a run
for dataset in datasets:
    graph.add_dataset_lineage(dataset)

# Terminal view
graph.print_ascii()

# Mermaid diagram (paste into any Mermaid renderer)
print(graph.to_mermaid())

# JSON for web UI or API
data = graph.to_dict()
```

### ASCII output

```
  customers
  ├─ customers.csv                   [source]
  │
  ├─ Dataset Discovery
  │
  ├─ Schema Validation               [PASS]
  │
  ├─ Quality Engine                  [PASS]  100.0%
  │
  ├─ Ingest (replace)                174,777 rows
  │
  └─ stg_customers                   [staging]
```

### Mermaid output

```
flowchart TD
    customers_source[("customers.csv")]
    customers_discovery[["Dataset Discovery"]]
    customers_schema_validation[["Schema Validation"]]
    customers_quality_check{{"Quality Engine"}}
    customers_ingest[["Ingest (replace)"]]
    customers_staging[("stg_customers")]

    customers_source --> customers_discovery
    customers_discovery --> customers_schema_validation
    customers_schema_validation --> customers_quality_check
    customers_quality_check --> customers_ingest
    customers_ingest --> customers_staging
```

---

## Observability queries

Direct SQL examples against the metadata tables:

```sql
-- Latest run summary
SELECT run_id, status, total_datasets, total_rows, total_duration, started_at
FROM pipeline_runs
ORDER BY started_at DESC
LIMIT 1;

-- Quality score trend for orders
SELECT r.started_at, q.score, q.status
FROM pipeline_quality_runs q
JOIN pipeline_runs r USING (run_id)
WHERE q.dataset_name = 'orders'
ORDER BY r.started_at DESC
LIMIT 30;

-- Rows loaded per dataset on the latest run
WITH latest AS (SELECT run_id FROM pipeline_runs ORDER BY started_at DESC LIMIT 1)
SELECT dataset_name, rows_loaded, load_strategy, load_mode, watermark_value
FROM pipeline_dataset_runs
WHERE run_id = (SELECT run_id FROM latest)
ORDER BY dataset_name;

-- Datasets that failed quality checks in the last 7 days
SELECT r.started_at, q.dataset_name, q.score, q.checks_failed
FROM pipeline_quality_runs q
JOIN pipeline_runs r USING (run_id)
WHERE q.status = 'FAIL'
  AND r.started_at >= NOW() - INTERVAL '7 days'
ORDER BY r.started_at DESC;

-- Current watermark state for incremental datasets
SELECT dataset_name, incremental_column, last_watermark_value,
       last_rows_loaded, last_loaded_at
FROM pipeline_incremental_state
ORDER BY dataset_name;
```
