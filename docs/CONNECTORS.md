# OpenIngest Connectors (v3.0)

OpenIngest ships **17 built-in source connectors** across four categories. All share the same interface — add a `source:` block to your dataset config and the framework routes reads automatically.

---

## How connectors work

```yaml
my_dataset:
  source:
    type: s3          # ConnectorRegistry resolves this
    bucket: my-bucket
    key: data/file.csv
  staging_table: stg_my_dataset
  load_strategy: replace
```

Without a `source:` block, OpenIngest falls back to reading the `file:` field as a local CSV (v1.0 behaviour).

---

## File Format Connectors

### CSV (built-in)

```yaml
source:
  type: csv
  file: customers.csv       # relative to data/raw/, or absolute path
  encoding: utf-8           # optional
  separator: ","            # optional
```

### Excel (v2.0)

```bash
pip install openingest[excel]
```

```yaml
source:
  type: excel
  file: data/raw/budget_2026.xlsx
  sheet: Q1           # sheet name or index, default 0
  header: 0
  skip_rows: 0
  use_cols: "A:F"     # optional
```

### JSON (built-in)

```yaml
source:
  type: json
  file: orders.json
  record_path: data.orders    # dot-separated path to records array
  lines: true                 # for NDJSON
```

### Parquet (v2.0)

```bash
pip install openingest[parquet]
```

```yaml
source:
  type: parquet
  file: data/raw/events.parquet
  columns: [event_id, session_id, timestamp, event_type]
```

---

## Cloud Storage Connectors

### Amazon S3 (v2.0)

```bash
pip install openingest[s3]
```

```yaml
source:
  type: s3
  bucket: company-data
  key: orders/2026/orders.parquet
  region: us-east-1
  aws_access_key_id: ${AWS_ACCESS_KEY_ID}
  aws_secret_access_key: ${AWS_SECRET_ACCESS_KEY}
  format: parquet             # auto-detected from key extension
  columns: [order_id, total]  # Parquet projection only
```

### Azure Blob Storage (v2.0)

```bash
pip install openingest[azure]
```

```yaml
source:
  type: azure
  container: company-data
  blob: products/products.parquet
  connection_string: ${AZURE_STORAGE_CONNECTION_STRING}
```

### Google Cloud Storage (v2.0)

```bash
pip install openingest[gcs]
```

```yaml
source:
  type: gcs
  bucket: company-data
  object: events/events.csv
  project: my-gcp-project
  credentials_file: ${GOOGLE_APPLICATION_CREDENTIALS}
```

---

## REST API Connector (v2.0)

```bash
pip install openingest[api]
```

```yaml
source:
  type: rest
  url: https://api.company.com/v1/orders
  method: GET
  headers:
    Authorization: Bearer ${API_TOKEN}
  record_path: data
  retry_count: 3
  retry_delay: 1.0
  pagination:
    type: offset          # or cursor
    param: offset
    limit_param: limit
    limit: 500
    max_pages: 50
```

Cursor-based pagination (Stripe-style):

```yaml
  pagination:
    type: cursor
    cursor_path: has_more
    param: starting_after
    max_pages: 100
```

---

## Database Connectors (v3.0)

### PostgreSQL

```bash
pip install openingest[postgresql]
```

```yaml
source:
  type: postgresql
  host: ${PG_HOST}
  port: 5432
  database: ${PG_DATABASE}
  username: ${PG_USER}
  password: ${PG_PASSWORD}
  query: "SELECT * FROM orders WHERE status = 'active'"
  # OR: table: orders
  chunk_size: 10000    # optional batched reads
```

### MySQL

```bash
pip install openingest[mysql]
```

```yaml
source:
  type: mysql
  host: ${MYSQL_HOST}
  port: 3306
  database: ${MYSQL_DATABASE}
  username: ${MYSQL_USER}
  password: ${MYSQL_PASSWORD}
  table: users
  # OR: query: "SELECT * FROM users WHERE active = 1"
  chunk_size: 10000
```

### MongoDB

```bash
pip install openingest[mongodb]
```

```yaml
source:
  type: mongodb
  uri: ${MONGODB_URI}
  database: analytics
  collection: events
  filter: {"status": "active"}       # optional query filter
  projection: {"_id": 0, "name": 1}  # optional field projection
  limit: 50000                        # optional row cap
  include_id: false                   # suppress _id column
```

---

## File Transfer Connectors (v3.0)

### SFTP

```bash
pip install openingest[sftp]
```

```yaml
source:
  type: sftp
  host: ${SFTP_HOST}
  port: 22
  username: ${SFTP_USER}
  password: ${SFTP_PASSWORD}
  # OR: private_key_path: ~/.ssh/id_rsa
  remote_path: /exports/daily_orders.csv
```

### FTP (built-in)

```yaml
source:
  type: ftp
  host: ${FTP_HOST}
  port: 21
  username: ${FTP_USER}
  password: ${FTP_PASSWORD}
  remote_path: /reports/monthly_sales.csv
```

Both SFTP and FTP auto-detect format from the file extension (CSV, JSON, Parquet, Excel).

---

## SaaS Connectors (v3.0)

### Salesforce

```bash
pip install openingest[salesforce]
```

```yaml
source:
  type: salesforce
  username: ${SF_USERNAME}
  password: ${SF_PASSWORD}
  security_token: ${SF_SECURITY_TOKEN}
  client_id: ${SF_CLIENT_ID}
  client_secret: ${SF_CLIENT_SECRET}
  object: Opportunity
  fields: [Id, Name, Amount, StageName, CloseDate]
  where_clause: "StageName = 'Closed Won'"
  # OR: soql: "SELECT Id, Name FROM Opportunity WHERE ..."
```

### HubSpot

```bash
pip install openingest[hubspot]
```

```yaml
source:
  type: hubspot
  access_token: ${HUBSPOT_ACCESS_TOKEN}
  object: contacts          # contacts, companies, deals, tickets
  properties: [firstname, lastname, email, createdate]
```

### Stripe

```bash
pip install openingest[stripe]
```

```yaml
source:
  type: stripe
  api_key: ${STRIPE_API_KEY}
  resource: charges         # charges, customers, invoices, subscriptions, ...
  created_after: "2024-01-01T00:00:00"
  limit: 10000              # optional record cap
```

### Google Sheets

```bash
pip install openingest[google_sheets]
```

```yaml
source:
  type: google_sheets
  spreadsheet_id: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
  sheet_name: Q1_Budget     # optional, defaults to first sheet
  range: A1:F500            # optional cell range
  service_account_file: ${GOOGLE_SERVICE_ACCOUNT_FILE}
  # OR: service_account_json: ${GOOGLE_SERVICE_ACCOUNT_JSON}
```

---

## Environment variable expansion

All `source:` string values support `${VAR_NAME}` at runtime. OpenIngest loads `.env` automatically and raises a clear `ConnectorError` if a variable is missing.

---

## Plugin architecture

Add any connector in one line:

```python
from core.connectors.registry import ConnectorRegistry

class SnowflakeConnector(BaseConnector):
    def read(self) -> pd.DataFrame:
        ...

ConnectorRegistry.register("snowflake", SnowflakeConnector)
```

Then use it in YAML as `type: snowflake`.

---

## Install reference

| Connector | Type key | Extra |
|---|---|---|
| CSV | `csv` | built-in |
| JSON / NDJSON | `json` | built-in |
| FTP | `ftp` | built-in |
| Excel | `excel` | `openingest[excel]` |
| Parquet | `parquet` | `openingest[parquet]` |
| Amazon S3 | `s3` | `openingest[s3]` |
| Azure Blob | `azure` | `openingest[azure]` |
| Google Cloud Storage | `gcs` | `openingest[gcs]` |
| REST API | `rest` / `api` | `openingest[api]` |
| PostgreSQL | `postgresql` / `postgres` | `openingest[postgresql]` |
| MySQL | `mysql` | `openingest[mysql]` |
| MongoDB | `mongodb` / `mongo` | `openingest[mongodb]` |
| SFTP | `sftp` | `openingest[sftp]` |
| Salesforce | `salesforce` | `openingest[salesforce]` |
| HubSpot | `hubspot` | `openingest[hubspot]` |
| Stripe | `stripe` | `openingest[stripe]` |
| Google Sheets | `google_sheets` | `openingest[google_sheets]` |
| All v3.0 | — | `openingest[connectors]` |
| Everything | — | `openingest[all]` |
