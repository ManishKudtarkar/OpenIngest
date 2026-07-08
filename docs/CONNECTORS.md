# OpenIngest Connectors (v2.0)

OpenIngest v2.0 ships 9 source connectors. All connectors share the same interface: add a `source:` block to your dataset config and the framework routes reads automatically.

---

## How connectors work

When a dataset config has a `source:` block, OpenIngest uses the `ConnectorRegistry` to resolve and instantiate the correct connector:

```yaml
my_dataset:
  source:
    type: s3        # ← ConnectorRegistry looks up 's3'
    bucket: my-bucket
    key: data/file.csv
  staging_table: stg_my_dataset
  load_strategy: replace
```

Without a `source:` block, OpenIngest falls back to reading the `file:` field as a local CSV (v1.0 behaviour).

---

## File Format Connectors

### CSV

Built-in. No installation required.

```yaml
source:
  type: csv
  file: customers.csv       # relative to data/raw/, or absolute path
  encoding: utf-8           # optional, default utf-8
  separator: ","            # optional, default comma
```

---

### Excel (.xlsx / .xls)

```bash
pip install openingest[excel]   # installs openpyxl
```

```yaml
source:
  type: excel
  file: data/raw/budget_2026.xlsx
  sheet: Q1           # sheet name or 0-based index, default 0
  header: 0           # row to use as column names, default 0
  skip_rows: 0        # rows to skip before header, default 0
  use_cols: "A:F"     # optional column range or list
```

---

### JSON

Built-in. No installation required.

```yaml
# Flat JSON array
source:
  type: json
  file: orders.json

# Nested JSON — navigate to records array
source:
  type: json
  file: api_response.json
  record_path: data.orders    # dot-separated path to the array

# Newline-delimited JSON (NDJSON)
source:
  type: json
  file: events.ndjson
  lines: true
```

---

### Parquet

```bash
pip install openingest[parquet]   # installs pyarrow
```

```yaml
source:
  type: parquet
  file: data/raw/events.parquet
  columns: [event_id, session_id, timestamp, event_type, amount_usd]  # optional projection
  filters: [["amount_usd", ">", 0]]   # optional predicate pushdown
  engine: pyarrow                      # or fastparquet
```

---

## Cloud Storage Connectors

All cloud connectors auto-detect the file format from the key/object/blob name extension. You can override with `format: csv|parquet|json|excel`.

### Amazon S3

```bash
pip install openingest[s3]   # installs boto3
```

**Authentication** (standard boto3 chain):
1. Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
2. `~/.aws/credentials`
3. IAM role (EC2 / ECS / Lambda)
4. Explicit keys in config (not recommended for production)

```yaml
source:
  type: s3
  bucket: company-data
  key: orders/2026/orders.parquet
  region: us-east-1                              # optional
  aws_access_key_id: ${AWS_ACCESS_KEY_ID}        # optional — prefer env vars or IAM
  aws_secret_access_key: ${AWS_SECRET_ACCESS_KEY}
  format: parquet                                # optional — auto-detected from key
  columns: [order_id, customer_id, total_usd]   # optional — Parquet projection only
```

---

### Azure Blob Storage

```bash
pip install openingest[azure]   # installs azure-storage-blob
```

**Authentication** — choose one:
- Connection string (recommended): set `AZURE_STORAGE_CONNECTION_STRING` env var
- SAS token: provide `azure_account_name` + `azure_sas_token`

```yaml
# Connection string (recommended)
source:
  type: azure
  container: company-data
  blob: products/products.parquet
  connection_string: ${AZURE_STORAGE_CONNECTION_STRING}

# SAS token
source:
  type: azure
  container: company-data
  blob: orders/orders.csv
  azure_account_name: mystorageaccount
  azure_sas_token: ${AZURE_SAS_TOKEN}
```

---

### Google Cloud Storage

```bash
pip install openingest[gcs]   # installs google-cloud-storage
```

**Authentication** (Application Default Credentials):
```bash
gcloud auth application-default login
# OR
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

```yaml
source:
  type: gcs
  bucket: company-data
  object: events/events.csv
  project: my-gcp-project                          # optional
  credentials_file: ${GOOGLE_APPLICATION_CREDENTIALS}   # optional explicit creds
```

---

## REST API Connector

```bash
pip install openingest[api]   # installs requests
```

The REST connector handles GET and POST requests, automatic retry on network errors and rate limits (429), environment variable expansion in headers, and both offset-based and cursor-based pagination.

### Basic GET

```yaml
source:
  type: rest
  url: https://api.company.com/v1/orders
  method: GET
  headers:
    Authorization: Bearer ${ORDERS_API_TOKEN}
    Accept: application/json
  record_path: data          # path to the array in the JSON response
  timeout: 30                # request timeout in seconds, default 30
```

### POST with body

```yaml
source:
  type: rest
  url: https://api.company.com/v1/export
  method: POST
  headers:
    Authorization: Bearer ${API_TOKEN}
  body:
    format: csv
    start_date: "2026-01-01"
  record_path: results
```

### Offset-based pagination

```yaml
source:
  type: rest
  url: https://api.company.com/v1/customers
  headers:
    Authorization: Bearer ${TOKEN}
  record_path: data
  pagination:
    type: offset
    param: offset            # query param name for offset counter
    limit_param: limit       # query param name for page size
    limit: 500               # rows per page
    max_pages: 50            # safety limit
```

### Cursor-based pagination (e.g. Stripe)

```yaml
source:
  type: rest
  url: https://api.stripe.com/v1/charges
  headers:
    Authorization: Bearer ${STRIPE_API_KEY}
  record_path: data
  pagination:
    type: cursor
    cursor_path: has_more    # path in response JSON to check for next page
    param: starting_after    # query param name to pass cursor value
    max_pages: 100
```

### Retry configuration

```yaml
source:
  type: rest
  url: https://api.company.com/v1/orders
  headers:
    Authorization: Bearer ${TOKEN}
  retry_count: 3             # retries on network error or 429/5xx, default 3
  retry_delay: 1.0           # seconds between retries, default 1.0
  verify_ssl: true           # SSL certificate verification, default true
```

---

## Environment variable expansion

All string values in `source:` blocks support `${VAR_NAME}` expansion at runtime:

```yaml
source:
  type: s3
  bucket: company-data
  key: orders.csv
  aws_access_key_id: ${AWS_ACCESS_KEY_ID}       # expands from environment
  aws_secret_access_key: ${AWS_SECRET_ACCESS_KEY}
```

OpenIngest raises a `ConnectorError` if a referenced variable is not set, with a clear message showing the variable name.

---

## Plugin architecture (v3.0)

Create a custom connector by subclassing `BaseConnector`:

```python
from core.connectors.base import BaseConnector
import pandas as pd

class SnowflakeConnector(BaseConnector):
    def read(self) -> pd.DataFrame:
        # self.config contains the source: block from datasets.yaml
        account = self.config["account"]
        # ... connect and return DataFrame
        return df
```

Register it:

```python
from core.connectors.registry import ConnectorRegistry
ConnectorRegistry.register("snowflake", SnowflakeConnector)
```

Or distribute as a package that auto-registers on import:

```bash
pip install openingest-snowflake
```

Then use in YAML:

```yaml
source:
  type: snowflake
  account: myaccount.us-east-1
  warehouse: COMPUTE_WH
  database: RAW
  schema: PUBLIC
  table: orders
```

---

## Install reference

| Connector | Extra | Command |
|---|---|---|
| CSV | — | Built-in |
| JSON | — | Built-in |
| Excel | `excel` | `pip install openingest[excel]` |
| Parquet | `parquet` | `pip install openingest[parquet]` |
| Amazon S3 | `s3` | `pip install openingest[s3]` |
| Azure Blob | `azure` | `pip install openingest[azure]` |
| Google Cloud | `gcs` | `pip install openingest[gcs]` |
| REST API | `api` | `pip install openingest[api]` |
| All v2.0 | `v2` | `pip install openingest[v2]` |
| Everything | `all` | `pip install openingest[all]` |
