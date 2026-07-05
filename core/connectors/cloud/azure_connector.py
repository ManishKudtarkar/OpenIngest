"""
Azure Blob Storage connector.

Reads CSV, JSON, Parquet, or Excel files from Azure Blob Storage.

Requires: azure-storage-blob
Install with: pip install azure-storage-blob

Authentication
--------------
OpenIngest supports two modes:
  1. Connection string:  AZURE_STORAGE_CONNECTION_STRING (recommended)
  2. Account name + SAS: azure_account_name + azure_sas_token

Config example
--------------
source:
  type: azure
  container: company-data
  blob: customers/customers.csv
  connection_string: ${AZURE_STORAGE_CONNECTION_STRING}

  # OR account + SAS token:
  azure_account_name: mystorageaccount
  azure_sas_token: ${AZURE_SAS_TOKEN}

  # Optional format override:
  format: parquet
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


class AzureBlobConnector(BaseConnector):
    """
    Read a blob from Azure Blob Storage into a DataFrame.

    Config keys
    -----------
    container : str
        Blob container name.
    blob : str
        Blob path / name within the container.
    connection_string : str or ${ENV_VAR}
        Azure Storage connection string.
    azure_account_name : str, optional
        Storage account name (used with SAS token).
    azure_sas_token : str or ${ENV_VAR}, optional
        SAS token for authentication.
    format : str, optional
        File format override: csv, json, parquet, excel.
    columns : list, optional
        Column subset for Parquet.
    sheet : str or int, optional
        Sheet for Excel files.
    separator : str, optional
        Column separator for CSV. Defaults to ','.

    Example
    -------
    source:
      type: azure
      container: company-data
      blob: orders/orders.parquet
      connection_string: ${AZURE_STORAGE_CONNECTION_STRING}
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            from azure.storage.blob import BlobServiceClient  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "azure-storage-blob is required for Azure connectors. "
                "Install with: pip install azure-storage-blob"
            )

        container: str = self.config["container"]
        blob_name: str = self.config["blob"]

        conn_str = self.config.get("connection_string") or os.environ.get(
            "AZURE_STORAGE_CONNECTION_STRING"
        )

        try:
            if conn_str:
                conn_str = _resolve_env(str(conn_str))
                client = BlobServiceClient.from_connection_string(conn_str)
            elif self.config.get("azure_account_name"):
                account = self.config["azure_account_name"]
                sas = _resolve_env(str(self.config.get("azure_sas_token", "")))
                account_url = f"https://{account}.blob.core.windows.net"
                client = BlobServiceClient(account_url=account_url, credential=sas)
            else:
                raise ConnectorError(
                    "AzureBlobConnector requires either 'connection_string' or "
                    "'azure_account_name' + 'azure_sas_token' in source config."
                )

            blob_client = client.get_blob_client(container=container, blob=blob_name)
            stream = blob_client.download_blob()
            content: bytes = stream.readall()

        except ConnectorError:
            raise
        except Exception as exc:
            raise ConnectorError(
                f"Failed to download Azure blob '{container}/{blob_name}': {exc}"
            ) from exc

        return self._parse(content, blob_name)

    def _parse(self, content: bytes, blob_name: str) -> pd.DataFrame:
        fmt = self.config.get("format") or self._detect_format(blob_name)
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
        for req in ("container", "blob"):
            if not self.config.get(req):
                raise ConnectorError(f"AzureBlobConnector requires '{req}' in source config.")
