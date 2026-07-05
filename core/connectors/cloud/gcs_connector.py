"""
Google Cloud Storage connector.

Reads CSV, JSON, Parquet, or Excel files from GCS.

Requires: google-cloud-storage
Install with: pip install google-cloud-storage

Authentication
--------------
Uses Application Default Credentials (ADC):
  gcloud auth application-default login
  OR set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

Config example
--------------
source:
  type: gcs
  bucket: company-data
  object: customers/customers.csv

  # Optional explicit credentials file:
  credentials_file: ${GOOGLE_APPLICATION_CREDENTIALS}

  # Optional project:
  project: my-gcp-project
"""

from __future__ import annotations

import io
import os
from typing import List, Optional

import pandas as pd

from core.connectors.base import BaseConnector, ConnectorError


def _resolve_env(value: str) -> str:
    if value and value.startswith("${") and value.endswith("}"):
        var = value[2:-1]
        resolved = os.environ.get(var)
        if resolved is None:
            raise ConnectorError(
                f"Environment variable '{var}' is not set. "
                f"Export it: export {var}=..."
            )
        return resolved
    return value


class GCSConnector(BaseConnector):
    """
    Read an object from Google Cloud Storage into a DataFrame.

    Config keys
    -----------
    bucket : str
        GCS bucket name.
    object : str
        Object name / path within the bucket.
    project : str, optional
        GCP project ID.
    credentials_file : str, optional
        Path to service account JSON (or ${ENV_VAR}).
    format : str, optional
        File format override: csv, json, parquet, excel.
    columns : list, optional
        Column subset for Parquet projection.
    separator : str, optional
        Column separator for CSV. Defaults to ','.
    sheet : str or int, optional
        Sheet for Excel files.

    Example
    -------
    source:
      type: gcs
      bucket: company-data
      object: orders/orders.parquet
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            from google.cloud import storage as gcs  # type: ignore[import]
            from google.oauth2 import service_account  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "google-cloud-storage is required for GCS connectors. "
                "Install with: pip install google-cloud-storage"
            )

        bucket_name: str = self.config["bucket"]
        object_name: str = self.config["object"]
        project: Optional[str] = self.config.get("project")
        creds_file: Optional[str] = self.config.get("credentials_file")

        try:
            if creds_file:
                creds_file = _resolve_env(str(creds_file))
                creds = service_account.Credentials.from_service_account_file(creds_file)
                client = gcs.Client(project=project, credentials=creds)
            else:
                client = gcs.Client(project=project)

            bucket = client.bucket(bucket_name)
            blob = bucket.blob(object_name)
            content: bytes = blob.download_as_bytes()

        except ConnectorError:
            raise
        except Exception as exc:
            raise ConnectorError(
                f"Failed to download gs://{bucket_name}/{object_name}: {exc}"
            ) from exc

        return self._parse(content, object_name)

    def _parse(self, content: bytes, object_name: str) -> pd.DataFrame:
        fmt = self.config.get("format") or self._detect_format(object_name)
        buf = io.BytesIO(content)

        if fmt == "csv":
            sep = self.config.get("separator", self.config.get("sep", ","))
            return pd.read_csv(buf, sep=sep)

        if fmt == "parquet":
            columns: Optional[List[str]] = self.config.get("columns")
            return pd.read_parquet(buf, columns=columns)

        if fmt == "json":
            lines: bool = bool(self.config.get("lines", False))
            return pd.read_json(buf, lines=lines)

        if fmt in ("excel", "xlsx", "xls"):
            sheet = self.config.get("sheet", 0)
            return pd.read_excel(buf, sheet_name=sheet, engine="openpyxl")

        raise ConnectorError(f"Unsupported format: '{fmt}'.")

    @staticmethod
    def _detect_format(name: str) -> str:
        n = name.lower()
        if n.endswith(".parquet") or n.endswith(".pq"):
            return "parquet"
        if n.endswith(".json") or n.endswith(".ndjson"):
            return "json"
        if n.endswith(".xlsx") or n.endswith(".xls"):
            return "excel"
        return "csv"

    def validate_config(self) -> None:
        for req in ("bucket", "object"):
            if not self.config.get(req):
                raise ConnectorError(f"GCSConnector requires '{req}' in source config.")
