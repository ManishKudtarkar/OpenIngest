# OpenIngest Usability And Observability

## Unified CLI

Run commands through:

```bash
python -m scripts.openingest <command>
```

Available commands:

- `run`: execute full pipeline
- `validate`: schema validation for registered datasets
- `quality`: quality checks for registered datasets
- `report`: latest run summary
- `history --limit 20`: pipeline + dataset run history
- `dashboard`: monitoring view with run summaries, dataset health, and trends

## Monitoring Dashboard

Run:

```bash
python -m scripts.dashboard
```

The dashboard shows:

- Last 5 pipeline runs
- Latest dataset health snapshot
- Dataset-level trends across last 20 runs

## Suggested Next Connectors

To expand beyond CSV:

1. Local file connectors: JSON, Excel, Parquet
2. Cloud storage connectors: S3, Azure Blob, GCS
3. API connector: paginated REST source ingestion

For each connector, keep the same pipeline contract:

- discover datasets
- validate schema and quality
- infer/ensure table
- load with full or incremental strategy