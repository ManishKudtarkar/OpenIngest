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

## Connector Coverage (v2.0)

| Connector | Status | Install |
|---|---|---|
| CSV | ✅ v1.0 | Built-in |
| JSON / NDJSON | ✅ v2.0 | Built-in |
| Excel (.xlsx) | ✅ v2.0 | `openingest[excel]` |
| Parquet | ✅ v2.0 | `openingest[parquet]` |
| Amazon S3 | ✅ v2.0 | `openingest[s3]` |
| Azure Blob Storage | ✅ v2.0 | `openingest[azure]` |
| Google Cloud Storage | ✅ v2.0 | `openingest[gcs]` |
| REST API | ✅ v2.0 | `openingest[api]` |
| Snowflake | 🔲 v3.0 | `openingest-snowflake` (plugin) |
| Salesforce | 🔲 v3.0 | `openingest-salesforce` (plugin) |

---

## Observability (v2.5)

| Feature | Status |
|---|---|
| Run ID + metadata per execution | ✅ |
| Per-dataset quality scores | ✅ |
| Incremental watermark state | ✅ |
| `openingest history` CLI | ✅ |
| `openingest dashboard` terminal view | ✅ |
| Slack webhook notifications | ✅ v2.5 |
| Email (SMTP) notifications | ✅ v2.5 |
| Data lineage graph (ASCII / Mermaid / JSON) | ✅ v3.0 |
| Web dashboard | 🔲 v3.0 |

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
| `README.md` | ✅ Updated for v2.0 |
| `docs/GETTING_STARTED.md` | ✅ Full 5-step walkthrough |
| `docs/CONNECTORS.md` | ✅ All 9 connectors with config examples |
| `docs/CLI_REFERENCE.md` | ✅ All 19 CLI commands documented |
| `docs/OPEN_SOURCE_READINESS.md` | ✅ This file |
| API reference (auto-generated) | 🔲 v3.0 |

---

## Next steps toward PyPI release (v3.0)

1. Expand test coverage for connectors, incremental loading, and observability paths
2. Add integration tests against a real PostgreSQL instance in CI
3. Add dataset profiling (`openingest profile`)
4. Build web dashboard
5. Set up GitHub release workflow to publish to PyPI
6. Add RBAC for multi-team environments
7. Create `openingest-snowflake` and `openingest-salesforce` plugin packages
