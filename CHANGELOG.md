# Changelog

All notable changes to OpenIngest are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning: [Semantic Versioning](https://semver.org/).

---

## [3.0.7] — 2026-09-06
### Fixed
- Renamed `dev` PyPI extra to `devel` to prevent `InvalidVersion: 'dev'` crash on Python 3.13 / Colab
- Excluded `notebooks/` from ruff lint scope
- Added `google-sheets` extra name (PEP 503 canonical form of `google_sheets`)

---

## [3.0.6] — 2026-09-06
### Fixed
- Added `testing` extra alias for `dev` to improve pip 3.10–3.12 compatibility
- Normalised `google_sheets` extra name to `google-sheets` (PEP 503)

---

## [3.0.5] — 2026-09-06
### Changed
- Version bump, connector count corrected to 17 in frontend and docs
- `openingest graph` and `openingest upgrade` documented in CLI_REFERENCE.md
- `discover` command documented with example output

---

## [3.0.4] — 2026-08-15
### Changed
- README rewritten as PyPI project description with full connector table, transforms example, CLI reference

---

## [3.0.3] — 2026-08-01
### Added
- First stable PyPI release: `pip install openingest`
- GitHub Actions publish workflow with OIDC Trusted Publisher

---

## [3.0.0] — 2026-07-01
### Added
- 9 new v3.0 connectors: PostgreSQL, MySQL, MongoDB, SFTP, FTP, Salesforce, HubSpot, Stripe, Google Sheets
- YAML Transformation Engine: rename, cast, filter, derive, aggregate, python
- Data lineage graph (ASCII + Mermaid + JSON export)
- Plugin architecture: `ConnectorRegistry.register()`
- 93 tests with ruff + mypy CI

---

## [2.5.0] — 2026-05-01
### Added
- Built-in cron scheduler (`openingest scheduler start`)
- Slack webhook + email (SMTP) notifications with retry
- `openingest doctor` environment health check

---

## [2.0.0] — 2026-03-01
### Added
- Excel, JSON, Parquet file format connectors
- Amazon S3, Azure Blob Storage, Google Cloud Storage connectors
- REST API connector with offset/cursor pagination and retry
- `openingest infer` — auto-generate datasets.yaml from CSV

---

## [1.0.0] — 2026-01-01
### Added
- Dataset discovery from `configs/datasets.yaml`
- Schema validation engine
- Data quality engine (non-null, unique, range, regex, custom rules)
- Incremental loading with watermark + SHA-256 hash CDC + upsert
- Auto table creation from inferred PostgreSQL types
- Metadata logging to `pipeline_runs` and `pipeline_dataset_runs`
- Apache Airflow 2.9 dynamic DAG generation
- Full CLI: run, validate, quality, report, history, dashboard
- GitHub Actions CI (ruff, mypy, pytest)
- Docker Compose stack (PostgreSQL + Airflow)
