# OpenIngest — Open Source Readiness

This document tracks the maturity and adoptability of OpenIngest as an open-source project.

---

## Package Installation

OpenIngest is installable as a Python package via `pyproject.toml`.

```bash
# Core install
pip install -e .

# With development tools (pytest, ruff, mypy)
pip install -e ".[dev]"

# With v2.0 connectors
pip install -e ".[v2]"       # all cloud + format connectors
pip install -e ".[s3]"       # Amazon S3 only
pip install -e ".[azure]"    # Azure Blob only
pip install -e ".[gcs]"      # Google Cloud Storage only
pip install -e ".[parquet]"  # Parquet (pyarrow)
pip install -e ".[excel]"    # Excel (openpyxl)
pip install -e ".[api]"      # REST API (requests)

# Full install
pip install -e ".[all]"
```

After install, the `openingest` CLI is available system-wide:

```bash
openingest --help
```

---

## CLI Completeness

All core operations are accessible from the CLI. No need to call Python modules directly.

| Command | Status |
|---|---|
| `openingest run` | ✅ |
| `openingest run --dry-run` | ✅ |
| `openingest run --dataset NAME` | ✅ |
| `openingest validate` | ✅ |
| `openingest quality` | ✅ |
| `openingest report` | ✅ |
| `openingest history` | ✅ |
| `openingest dashboard` | ✅ |
| `openingest scheduler start` | ✅ v2.5 |
| `openingest schedule PRESET` | ✅ |
| `openingest infer FILE` | ✅ |
| `openingest profile FILE` | ✅ |
| `openingest doctor` | ✅ |
| `openingest discover` | ✅ |
| `openingest add-dataset` | ✅ |
| `openingest init PROJECT` | ✅ |
| `openingest version` | ✅ |
| `openingest docker init` | ✅ |
| `openingest airflow build` | ✅ |

---

## Connector Coverage (v3.0)

| Connector | Status | Install |
|---|---|---|
| CSV | ✅ v1.0 | Built-in |
| JSON / NDJSON | ✅ v2.0 | Built-in |
| FTP | ✅ v3.0 | Built-in |
| Excel (.xlsx) | ✅ v2.0 | `openingest[excel]` |
| Parquet | ✅ v2.0 | `openingest[parquet]` |
| Amazon S3 | ✅ v2.0 | `openingest[s3]` |
| Azure Blob Storage | ✅ v2.0 | `openingest[azure]` |
| Google Cloud Storage | ✅ v2.0 | `openingest[gcs]` |
| REST API | ✅ v2.0 | `openingest[api]` |
| PostgreSQL | ✅ v3.0 | `openingest[postgresql]` |
| MySQL | ✅ v3.0 | `openingest[mysql]` |
| MongoDB | ✅ v3.0 | `openingest[mongodb]` |
| SFTP | ✅ v3.0 | `openingest[sftp]` |
| Salesforce | ✅ v3.0 | `openingest[salesforce]` |
| HubSpot | ✅ v3.0 | `openingest[hubspot]` |
| Stripe | ✅ v3.0 | `openingest[stripe]` |
| Google Sheets | ✅ v3.0 | `openingest[google_sheets]` |
| Snowflake | 🔲 v4.0 | `openingest-snowflake` (plugin) |
| BigQuery | 🔲 v4.0 | `openingest-bigquery` (plugin) |

---

## Observability (v2.5 / v3.0)

| Feature | Status |
|---|---|
| Run ID + metadata per execution | ✅ |
| Per-dataset quality scores | ✅ |
| Incremental watermark state | ✅ |
| `openingest history` CLI | ✅ |
| `openingest dashboard` terminal view | ✅ |
| Slack webhook notifications + retry | ✅ v2.5 |
| Email (SMTP) notifications + retry | ✅ v2.5 |
| Data lineage graph (ASCII / Mermaid / JSON) | ✅ v3.0 |
| Web dashboard | 🔲 v4.0 |

---

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

| Step | Tool | Status |
|---|---|---|
| Lint | `ruff check .` | ✅ |
| Type check | `mypy core/ utils/ models/ scripts/ --ignore-missing-imports` | ✅ |
| Tests + coverage | `pytest --cov=core --cov=utils` | ✅ |

Workflow file: `.github/workflows/ci.yml`

---

## Documentation

| Document | Status |
|---|---|
| `README.md` | ✅ Updated for v3.0.4 — PyPI description |
| `docs/GETTING_STARTED.md` | ✅ Full walkthrough + cloud + v3.0 connectors |
| `docs/CONNECTORS.md` | ✅ All 17 connectors with config examples |
| `docs/CLI_REFERENCE.md` | ✅ All CLI commands documented |
| `docs/USABILITY_AND_OBSERVABILITY.md` | ✅ Metadata tables, notifications, lineage |
| `docs/OPEN_SOURCE_READINESS.md` | ✅ This file — v3.0.4 |
| API reference (auto-generated) | 🔲 v4.0 |

---

## Next steps toward v4.0

1. Web dashboard (operational — not the landing page)
2. RBAC for multi-team environments
3. Snowflake and BigQuery connectors
4. Multi-environment config support (dev/staging/prod)
5. `openingest-snowflake` and `openingest-bigquery` plugin packages
