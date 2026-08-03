# Requirements Document

## Introduction

This feature expands OpenIngest 3.0.0 with two major capabilities to close competitive gaps with Airbyte (connector breadth) and dbt (transformation layer):

1. **Extended Source Connectors** — adds database connectors (PostgreSQL, MySQL, MongoDB), SaaS connectors (Salesforce, HubSpot, Stripe, Google Sheets), and FTP/SFTP connectors, all fitting the existing `BaseConnector → ConnectorRegistry` plugin architecture.

2. **Data Transformation Layer** — adds a declarative YAML and Python transformation system that runs as a new `transform` stage in the pipeline between `ingest` and `metadata log`, allowing column renaming, type casting, filtering, derived columns, and aggregations.

All new connectors extend `BaseConnector` and are registered via `ConnectorRegistry.register()`. The transformation layer introduces a new `TransformEngine` that reads per-dataset `transforms:` blocks from `datasets.yaml` and applies them to the ingested `pd.DataFrame` before it is written to the staging table.

---

## Glossary

- **BaseConnector**: Abstract base class in `core/connectors/base.py`; all connectors must implement `read() -> pd.DataFrame`.
- **ConnectorRegistry**: Plugin registry in `core/connectors/registry.py`; maps source type strings to connector classes via `register(name, cls)`.
- **ConnectorError**: Exception class raised by any connector on failure.
- **Dataset**: Model object representing one configured dataset from `datasets.yaml`.
- **Pipeline**: The orchestrated sequence — discover → validate → quality → ingest → **transform** → metadata log.
- **TransformEngine**: New component that parses and executes the `transforms:` block for a dataset.
- **TransformStep**: A single transformation operation (rename, cast, filter, derive, aggregate).
- **TransformError**: Exception raised when a transformation fails.
- **datasets.yaml**: The YAML file in `configs/` that configures datasets, sources, and now transforms.
- **staging_table**: The PostgreSQL table where ingested (and optionally transformed) data lands.
- **incremental_column**: Column used for watermark-based incremental loads.
- **SQL query**: A SQL SELECT statement string used by database connectors to define what data to read.
- **Cursor**: Database result set iterator used by database connectors.
- **SFTP**: SSH File Transfer Protocol; secure file transfer over SSH.
- **FTP**: File Transfer Protocol; unencrypted file transfer.
- **OAuth2**: Authorization framework used by SaaS connectors (Salesforce, HubSpot).
- **API key**: Secret token used for authentication by SaaS connectors (Stripe).
- **Service account**: Google Cloud credentials JSON used by the Google Sheets connector.
- **Chunk size**: Number of rows fetched per batch when reading large database tables.
- **Python transform**: A user-supplied Python function that receives and returns a `pd.DataFrame`.
- **Derived column**: A new column computed from an expression evaluated against existing columns.

---

## Requirements

### Requirement 1: PostgreSQL Source Connector

**User Story:** As a data engineer, I want to ingest data from a PostgreSQL database, so that I can consolidate relational data into OpenIngest pipelines without manual exports.

#### Acceptance Criteria

1. WHEN a dataset source is configured with `type: postgresql`, THE PostgreSQL_Connector SHALL connect to the specified host, port, database, and credentials and return a `pd.DataFrame`.
2. WHEN a `query` key is provided in the source config, THE PostgreSQL_Connector SHALL execute the SQL query and return results as a `pd.DataFrame`.
3. WHEN a `table` key is provided without a `query` key, THE PostgreSQL_Connector SHALL execute `SELECT * FROM <table>` and return results as a `pd.DataFrame`.
4. WHEN a `chunk_size` key is provided, THE PostgreSQL_Connector SHALL fetch rows in batches of the specified size and concatenate them into a single `pd.DataFrame`.
5. IF the database connection cannot be established, THEN THE PostgreSQL_Connector SHALL raise a `ConnectorError` with a message containing the host, port, and database name.
6. IF neither `query` nor `table` is present in the source config, THEN THE PostgreSQL_Connector SHALL raise a `ConnectorError` stating that one of `query` or `table` is required.
7. THE PostgreSQL_Connector SHALL support `${ENV_VAR}` references in `host`, `port`, `database`, `username`, and `password` config keys.
8. THE ConnectorRegistry SHALL register the PostgreSQL_Connector under the type name `postgresql`.

---

### Requirement 2: MySQL Source Connector

**User Story:** As a data engineer, I want to ingest data from a MySQL database, so that I can bring MySQL-backed application data into OpenIngest pipelines.

#### Acceptance Criteria

1. WHEN a dataset source is configured with `type: mysql`, THE MySQL_Connector SHALL connect to the specified host, port, database, and credentials and return a `pd.DataFrame`.
2. WHEN a `query` key is provided, THE MySQL_Connector SHALL execute the SQL query and return results as a `pd.DataFrame`.
3. WHEN a `table` key is provided without a `query` key, THE MySQL_Connector SHALL execute `SELECT * FROM <table>` and return results as a `pd.DataFrame`.
4. WHEN a `chunk_size` key is provided, THE MySQL_Connector SHALL fetch rows in batches of the specified size and concatenate them into a single `pd.DataFrame`.
5. IF the database connection cannot be established, THEN THE MySQL_Connector SHALL raise a `ConnectorError` with a message containing the host, port, and database name.
6. IF neither `query` nor `table` is present in the source config, THEN THE MySQL_Connector SHALL raise a `ConnectorError` stating that one of `query` or `table` is required.
7. THE MySQL_Connector SHALL support `${ENV_VAR}` references in `host`, `port`, `database`, `username`, and `password` config keys.
8. THE ConnectorRegistry SHALL register the MySQL_Connector under the type name `mysql`.

---

### Requirement 3: MongoDB Source Connector

**User Story:** As a data engineer, I want to ingest data from a MongoDB collection, so that I can flatten document-oriented data into tabular DataFrames for downstream analysis.

#### Acceptance Criteria

1. WHEN a dataset source is configured with `type: mongodb`, THE MongoDB_Connector SHALL connect to the specified URI (or host/port/database) and return documents from the specified `collection` as a `pd.DataFrame`.
2. WHEN a `filter` key is provided, THE MongoDB_Connector SHALL apply the filter document to the MongoDB query before fetching results.
3. WHEN a `projection` key is provided, THE MongoDB_Connector SHALL apply the projection document to limit the fields returned.
4. WHEN a `limit` key is provided, THE MongoDB_Connector SHALL return at most `limit` documents.
5. IF the MongoDB connection cannot be established, THEN THE MongoDB_Connector SHALL raise a `ConnectorError` with the connection URI (credentials redacted) and the error reason.
6. IF `collection` is not specified in the source config, THEN THE MongoDB_Connector SHALL raise a `ConnectorError` stating that `collection` is required.
7. THE MongoDB_Connector SHALL remove the `_id` field from the resulting `pd.DataFrame` unless `include_id: true` is set in the source config.
8. THE MongoDB_Connector SHALL support `${ENV_VAR}` references in `uri`, `username`, and `password` config keys.
9. THE ConnectorRegistry SHALL register the MongoDB_Connector under the type name `mongodb`.

---

### Requirement 4: FTP and SFTP Source Connectors

**User Story:** As a data engineer, I want to ingest files from FTP and SFTP servers, so that I can process data delivered by partners or legacy systems via file transfer protocols.

#### Acceptance Criteria

1. WHEN a dataset source is configured with `type: sftp`, THE SFTP_Connector SHALL connect to the specified host and port using the provided username and either `password` or `private_key_path`, download the file at `remote_path`, and return a `pd.DataFrame`.
2. WHEN a dataset source is configured with `type: ftp`, THE FTP_Connector SHALL connect to the specified host and port using the provided `username` and `password`, download the file at `remote_path`, and return a `pd.DataFrame`.
3. WHEN the downloaded file extension is `.csv`, THE SFTP_Connector AND THE FTP_Connector SHALL parse it as CSV.
4. WHEN the downloaded file extension is `.json`, THE SFTP_Connector AND THE FTP_Connector SHALL parse it as JSON.
5. WHEN the downloaded file extension is `.parquet`, THE SFTP_Connector AND THE FTP_Connector SHALL parse it as Parquet.
6. WHEN the downloaded file extension is `.xlsx` or `.xls`, THE SFTP_Connector AND THE FTP_Connector SHALL parse it as Excel.
7. IF the server connection cannot be established, THEN THE SFTP_Connector AND THE FTP_Connector SHALL raise a `ConnectorError` with the host, port, and error reason.
8. IF the remote file is not found, THEN THE SFTP_Connector AND THE FTP_Connector SHALL raise a `ConnectorError` with the `remote_path` and host.
9. THE SFTP_Connector AND THE FTP_Connector SHALL support `${ENV_VAR}` references in `host`, `username`, `password`, and `private_key_path` config keys.
10. THE ConnectorRegistry SHALL register the SFTP_Connector under the type name `sftp` and the FTP_Connector under the type name `ftp`.

---

### Requirement 5: Salesforce Source Connector

**User Story:** As a revenue operations analyst, I want to ingest Salesforce objects (e.g., Opportunity, Account, Lead), so that I can analyze CRM data alongside other business datasets.

#### Acceptance Criteria

1. WHEN a dataset source is configured with `type: salesforce`, THE Salesforce_Connector SHALL authenticate using the provided `username`, `password`, `security_token`, and `client_id`/`client_secret` via the Salesforce OAuth2 username-password flow.
2. WHEN an `object` key is provided, THE Salesforce_Connector SHALL query all fields of the specified Salesforce object using SOQL and return results as a `pd.DataFrame`.
3. WHEN a `soql` key is provided, THE Salesforce_Connector SHALL execute the provided SOQL query and return results as a `pd.DataFrame`.
4. WHEN a `fields` list is provided alongside `object`, THE Salesforce_Connector SHALL query only the specified fields.
5. WHEN a `where_clause` is provided alongside `object`, THE Salesforce_Connector SHALL append it to the SOQL query as a `WHERE` clause.
6. IF authentication fails, THEN THE Salesforce_Connector SHALL raise a `ConnectorError` with the HTTP status code and error description returned by Salesforce.
7. IF neither `object` nor `soql` is specified, THEN THE Salesforce_Connector SHALL raise a `ConnectorError` stating that one of `object` or `soql` is required.
8. THE Salesforce_Connector SHALL support `${ENV_VAR}` references in `username`, `password`, `security_token`, `client_id`, and `client_secret` config keys.
9. THE ConnectorRegistry SHALL register the Salesforce_Connector under the type name `salesforce`.

---

### Requirement 6: HubSpot Source Connector

**User Story:** As a marketing analyst, I want to ingest HubSpot CRM records (contacts, companies, deals), so that I can analyze marketing pipeline data in my data warehouse.

#### Acceptance Criteria

1. WHEN a dataset source is configured with `type: hubspot`, THE HubSpot_Connector SHALL authenticate using the provided `api_key` or `access_token`.
2. WHEN an `object` key is provided (e.g., `contacts`, `companies`, `deals`), THE HubSpot_Connector SHALL call the HubSpot v3 CRM API for that object and return all records as a `pd.DataFrame`.
3. WHEN a `properties` list is provided, THE HubSpot_Connector SHALL request only the specified properties from the API.
4. WHEN pagination is required, THE HubSpot_Connector SHALL follow HubSpot's cursor-based pagination until all records are retrieved.
5. IF the API returns a non-200 HTTP status, THEN THE HubSpot_Connector SHALL raise a `ConnectorError` with the status code and response body.
6. IF `object` is not specified in the source config, THEN THE HubSpot_Connector SHALL raise a `ConnectorError` stating that `object` is required.
7. THE HubSpot_Connector SHALL support `${ENV_VAR}` references in `api_key` and `access_token` config keys.
8. THE ConnectorRegistry SHALL register the HubSpot_Connector under the type name `hubspot`.

---

### Requirement 7: Stripe Source Connector

**User Story:** As a finance analyst, I want to ingest Stripe objects (charges, customers, invoices, subscriptions), so that I can analyze payment data alongside operational metrics.

#### Acceptance Criteria

1. WHEN a dataset source is configured with `type: stripe`, THE Stripe_Connector SHALL authenticate using the provided `api_key`.
2. WHEN a `resource` key is provided (e.g., `charges`, `customers`, `invoices`, `subscriptions`), THE Stripe_Connector SHALL call the corresponding Stripe API list endpoint and return all records as a `pd.DataFrame`.
3. WHEN a `limit` key is provided, THE Stripe_Connector SHALL return at most `limit` records.
4. WHEN `created_after` is provided as an ISO-8601 timestamp, THE Stripe_Connector SHALL filter records created after that timestamp.
5. WHEN pagination is required, THE Stripe_Connector SHALL follow Stripe's cursor-based list pagination until all matching records are retrieved.
6. IF the API returns an error response, THEN THE Stripe_Connector SHALL raise a `ConnectorError` with the Stripe error type and message.
7. IF `resource` is not specified in the source config, THEN THE Stripe_Connector SHALL raise a `ConnectorError` stating that `resource` is required.
8. THE Stripe_Connector SHALL support `${ENV_VAR}` references in the `api_key` config key.
9. THE ConnectorRegistry SHALL register the Stripe_Connector under the type name `stripe`.

---

### Requirement 8: Google Sheets Source Connector

**User Story:** As a business analyst, I want to ingest data from Google Sheets, so that I can incorporate spreadsheet-managed data into automated ingestion pipelines.

#### Acceptance Criteria

1. WHEN a dataset source is configured with `type: google_sheets`, THE GoogleSheets_Connector SHALL authenticate using a service account JSON file at `service_account_file` or a `service_account_json` inline string.
2. WHEN a `spreadsheet_id` and optional `sheet_name` are provided, THE GoogleSheets_Connector SHALL read the specified sheet and return its data as a `pd.DataFrame`, using the first row as column headers.
3. WHEN `sheet_name` is omitted, THE GoogleSheets_Connector SHALL read the first sheet in the spreadsheet.
4. WHEN a `range` key is provided (e.g., `A1:D100`), THE GoogleSheets_Connector SHALL read only the specified range.
5. IF authentication fails, THEN THE GoogleSheets_Connector SHALL raise a `ConnectorError` with the credential file path and the error reason.
6. IF `spreadsheet_id` is not specified, THEN THE GoogleSheets_Connector SHALL raise a `ConnectorError` stating that `spreadsheet_id` is required.
7. THE GoogleSheets_Connector SHALL support `${ENV_VAR}` references in `service_account_file` and `service_account_json` config keys.
8. THE ConnectorRegistry SHALL register the GoogleSheets_Connector under the type name `google_sheets`.

---

### Requirement 9: Connector Plugin Extras in pyproject.toml

**User Story:** As an OpenIngest user, I want to install only the connector dependencies I need, so that I don't bloat my environment with unused libraries.

#### Acceptance Criteria

1. THE pyproject.toml SHALL define optional dependency groups `postgresql`, `mysql`, `mongodb`, `sftp`, `salesforce`, `hubspot`, `stripe`, and `google_sheets`, each listing the exact pip packages required by that connector.
2. THE pyproject.toml SHALL define a `connectors` optional dependency group that includes all dependencies from Acceptance Criterion 1.
3. WHEN a connector's required library is not installed and the connector's `read()` method is called, THE connector SHALL raise a `ConnectorError` with an `ImportError` message that includes the exact `pip install` command to install the missing extra.
4. THE pyproject.toml SHALL update the `all` optional dependency group to include all new connector packages.

---

### Requirement 10: Transformation Layer — TransformEngine

**User Story:** As a data engineer, I want to define transformations in `datasets.yaml` that run after ingestion, so that I can reshape and clean data without writing custom ETL scripts.

#### Acceptance Criteria

1. THE Pipeline SHALL execute a `transform` stage after data is read from the source and before the `pd.DataFrame` is written to the staging table.
2. WHEN a dataset has no `transforms:` block in its config, THE TransformEngine SHALL return the `pd.DataFrame` unchanged.
3. WHEN a dataset has a `transforms:` block, THE TransformEngine SHALL apply each listed `TransformStep` in the order they are defined.
4. WHEN all `TransformSteps` complete without error, THE TransformEngine SHALL return the transformed `pd.DataFrame`.
5. IF a `TransformStep` raises an exception, THEN THE TransformEngine SHALL raise a `TransformError` with the step index, step type, and the original exception message.
6. THE TransformEngine SHALL be importable from `core.transform`.

---

### Requirement 11: Rename Transform

**User Story:** As a data engineer, I want to rename columns after ingestion, so that I can standardize column naming conventions without modifying source systems.

#### Acceptance Criteria

1. WHEN a transform step has `type: rename` and a `columns` mapping, THE TransformEngine SHALL rename each source column key to its target column value in the `pd.DataFrame`.
2. WHEN a source column listed in the `columns` mapping does not exist in the `pd.DataFrame`, THE TransformEngine SHALL raise a `TransformError` identifying the missing column name.
3. THE rename transform SHALL preserve all columns not listed in the `columns` mapping unchanged.

---

### Requirement 12: Cast Transform

**User Story:** As a data engineer, I want to cast column data types after ingestion, so that I can ensure correct types are stored in the staging table.

#### Acceptance Criteria

1. WHEN a transform step has `type: cast` and a `columns` mapping of column names to type strings, THE TransformEngine SHALL cast each specified column to the target type.
2. THE cast transform SHALL support type strings: `int`, `float`, `str`, `bool`, `date`, and `datetime`.
3. WHEN casting to `date` or `datetime`, THE TransformEngine SHALL accept an optional `format` key per column specifying the strptime format string.
4. IF a column value cannot be cast to the target type, THE TransformEngine SHALL raise a `TransformError` identifying the column name, target type, and a sample of the failing value.
5. WHEN a column listed in the `columns` mapping does not exist in the `pd.DataFrame`, THE TransformEngine SHALL raise a `TransformError` identifying the missing column name.

---

### Requirement 13: Filter Transform

**User Story:** As a data engineer, I want to filter rows after ingestion, so that I can exclude irrelevant or invalid records before loading into the staging table.

#### Acceptance Criteria

1. WHEN a transform step has `type: filter` and an `expression` string, THE TransformEngine SHALL evaluate the expression using `pd.DataFrame.query()` and return only the rows that satisfy it.
2. IF the `expression` is syntactically invalid, THEN THE TransformEngine SHALL raise a `TransformError` with the expression string and the pandas error message.
3. WHEN a `filter` step removes all rows from the `pd.DataFrame`, THE TransformEngine SHALL return an empty `pd.DataFrame` without raising an error.

---

### Requirement 14: Derive Transform

**User Story:** As a data engineer, I want to add derived columns computed from existing column values, so that I can create enriched fields for analysis.

#### Acceptance Criteria

1. WHEN a transform step has `type: derive` and a `columns` mapping of new column names to expression strings, THE TransformEngine SHALL evaluate each expression using `pd.DataFrame.eval()` and add the result as a new column.
2. WHEN a derived column name already exists in the `pd.DataFrame`, THE TransformEngine SHALL overwrite the existing column with the computed values.
3. IF an expression string is syntactically invalid, THEN THE TransformEngine SHALL raise a `TransformError` with the column name, expression string, and the pandas error message.

---

### Requirement 15: Aggregate Transform

**User Story:** As a data engineer, I want to aggregate data after ingestion, so that I can pre-compute summary metrics before loading into the staging table.

#### Acceptance Criteria

1. WHEN a transform step has `type: aggregate`, a `group_by` list of column names, and an `aggregations` mapping, THE TransformEngine SHALL group the `pd.DataFrame` by the `group_by` columns and apply the specified aggregation functions.
2. THE aggregate transform SHALL support aggregation functions: `sum`, `mean`, `min`, `max`, `count`, `first`, and `last`.
3. WHEN `group_by` is an empty list, THE TransformEngine SHALL apply the aggregation across the entire `pd.DataFrame` and return a single-row result.
4. IF a column referenced in `aggregations` does not exist in the `pd.DataFrame`, THEN THE TransformEngine SHALL raise a `TransformError` identifying the missing column name.
5. IF an unsupported aggregation function is specified, THEN THE TransformEngine SHALL raise a `TransformError` listing the unsupported function and the supported functions.

---

### Requirement 16: Python Transform

**User Story:** As a data engineer, I want to supply a custom Python function as a transformation step, so that I can apply arbitrary logic that cannot be expressed in YAML.

#### Acceptance Criteria

1. WHEN a transform step has `type: python` and a `function` key specifying a dotted import path (e.g., `my_package.transforms.normalize`), THE TransformEngine SHALL import the function, call it with the current `pd.DataFrame` as its sole argument, and use the returned `pd.DataFrame` as the output.
2. WHEN a transform step has `type: python` and an `inline` key containing a Python code string, THE TransformEngine SHALL execute the code string with `df` bound to the current `pd.DataFrame`, expect the code to reassign `df`, and use the resulting `df` as the output.
3. IF the imported function raises an exception, THEN THE TransformEngine SHALL raise a `TransformError` with the function path and the original exception message.
4. IF the imported function does not return a `pd.DataFrame`, THEN THE TransformEngine SHALL raise a `TransformError` stating that the function must return a `pd.DataFrame`.
5. IF the dotted import path cannot be resolved, THEN THE TransformEngine SHALL raise a `TransformError` with the import path and a `ModuleNotFoundError` message.

---

### Requirement 17: Transformation YAML Configuration Schema

**User Story:** As a data engineer, I want a documented YAML schema for the `transforms:` block, so that I can configure transformations without reading source code.

#### Acceptance Criteria

1. THE datasets.yaml SHALL support an optional `transforms:` list at the dataset level, appearing after `load_strategy` and before or after `required_columns`.
2. WHEN a `transforms:` block is present, each list item SHALL contain a required `type` key with one of the values: `rename`, `cast`, `filter`, `derive`, `aggregate`, or `python`.
3. THE datasets.yaml SHALL support inline documentation comments illustrating each transform type with a working example.
4. WHEN the `TransformEngine` reads the `transforms:` block and encounters an unknown `type` value, THE TransformEngine SHALL raise a `TransformError` listing the unknown type and the supported types.

---

### Requirement 18: Pipeline Integration of Transform Stage

**User Story:** As a data engineer, I want the transformation stage to integrate transparently into the existing pipeline, so that existing datasets without transforms continue to work unchanged.

#### Acceptance Criteria

1. WHEN the pipeline ingests a dataset, THE Pipeline SHALL pass the `pd.DataFrame` returned by the connector through the `TransformEngine` before writing it to the staging table.
2. WHEN a dataset has no `transforms:` block, THE Pipeline SHALL pass the `pd.DataFrame` to the staging table write without modification.
3. WHEN `dry_run` is `True`, THE Pipeline SHALL apply transforms and report the transformed row count and column list, but SHALL NOT write to the staging table.
4. IF the `TransformEngine` raises a `TransformError`, THEN THE Pipeline SHALL log the error, mark the dataset as skipped, increment the skipped counter, and continue to the next dataset.
5. THE Pipeline SHALL log the number of rows and columns before and after transformation when at least one transform step is applied.

---

### Requirement 19: datasets.yaml Example Entries for New Connectors and Transforms

**User Story:** As a user adopting new connectors or transforms, I want commented-out example entries in `datasets.yaml`, so that I can quickly understand and copy the configuration syntax.

#### Acceptance Criteria

1. THE datasets.yaml SHALL include commented-out example entries for each new connector type: `postgresql`, `mysql`, `mongodb`, `sftp`, `ftp`, `salesforce`, `hubspot`, `stripe`, and `google_sheets`.
2. THE datasets.yaml SHALL include a commented-out example entry demonstrating the `transforms:` block with at least `rename`, `cast`, `filter`, `derive`, and `aggregate` steps applied to a single dataset.
3. WHEN a user copies an example entry and fills in the required values, THE Pipeline SHALL be able to run that dataset without further configuration changes.
