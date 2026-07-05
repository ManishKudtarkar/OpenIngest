"""
Amazon S3 connector.

Reads CSV, JSON, Parquet, or Excel files directly from S3.

Requires: boto3
Install with: pip install boto3

Authentication
--------------
OpenIngest uses the standard boto3 credential chain:
  1. Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
  2. ~/.aws/credentials file
  3. IAM role (EC2/ECS/Lambda)
  4. Explicit keys in source config (not recommended for production)

Config example
--------------
source:
  type: s3
  bucket: company-data
  key: customers/customers.csv

  # Optional: explicit credentials (prefer env vars or IAM roles)
  aws_access_key_id: ${AWS_ACCESS_KEY_ID}
  aws_secret_access_key: ${AWS_SECRET_ACCESS_KEY}
  region: us-east-1

  # Optional: for Parquet
  format: parquet
  columns: [order_id, customer_id, total_usd]
"""

from __future__ import annotations

import io
import os
from typing import Any, Dict, List, Optional

import pandas as pd

from core.connectors.base import BaseConnector, ConnectorError


def _resolve_env(value: str) -> str:
    """Expand ${VAR_NAME} environment variable references."""
    if value and value.startswith("${") and value.endswith("}"):
        var = value[2:-1]
        resolved = os.environ.get(var)
        if resolved is None:
            raise ConnectorError(
                f"Environment variable '{var}' is not set. "
                f"Export it before running: export {var}=..."
            )
        return resolved
    return value


class S3Connector(BaseConnector):
    """
    Read a file from Amazon S3 into a DataFrame.

    Config keys
    -----------
    bucket : str
        S3 bucket name.
    key : str
        Object key (path within the bucket).
    format : str, optional
        File format: 'csv' (default), 'json', 'parquet', 'excel'.
        Auto-detected from the key extension if not specified.
    region : str, optional
        AWS region. Defaults to boto3 default.
    aws_access_key_id : str, optional
        Explicit access key or ${ENV_VAR} reference.
    aws_secret_access_key : str, optional
        Explicit secret key or ${ENV_VAR} reference.
    aws_session_token : str, optional
        Session token for temporary credentials.
    columns : list, optional
        Column subset (Parquet projection pushdown only).
    sheet : str or int, optional
        Sheet name/index for Excel files.

    Example
    -------
    source:
      type: s3
      bucket: company-data
      key: customers/customers.csv
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            import boto3  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "boto3 is required for S3 connectors. "
                "Install with: pip install boto3"
            )

        bucket: str = self.config["bucket"]
        key: str = self.config["key"]
        region: Optional[str] = self.config.get("region")

        session_kwargs: Dict[str, Any] = {}

        if self.config.get("aws_access_key_id"):
            session_kwargs["aws_access_key_id"] = _resolve_env(self.config["aws_access_key_id"])
        if self.config.get("aws_secret_access_key"):
            session_kwargs["aws_secret_access_key"] = _resolve_env(self.config["aws_secret_access_key"])
        if self.config.get("aws_session_token"):
            session_kwargs["aws_session_token"] = _resolve_env(self.config["aws_session_token"])
        if region:
            session_kwargs["region_name"] = region

        try:
            session = boto3.Session(**session_kwargs)
            s3 = session.client("s3")
            response = s3.get_object(Bucket=bucket, Key=key)
            content = response["Body"].read()
        except Exception as exc:
            raise ConnectorError(
                f"Failed to fetch s3://{bucket}/{key}: {exc}"
            ) from exc

        return self._parse(content, key)

    def _parse(self, content: bytes, key: str) -> pd.DataFrame:
        fmt = self.config.get("format") or self._detect_format(key)
        buf = io.BytesIO(content)

        if fmt == "csv":
            sep = self.config.get("separator", self.config.get("sep", ","))
            return pd.read_csv(buf, sep=sep)

        if fmt in ("parquet",):
            columns: Optional[List[str]] = self.config.get("columns")
            return pd.read_parquet(buf, columns=columns)

        if fmt == "json":
            lines: bool = bool(self.config.get("lines", False))
            return pd.read_json(buf, lines=lines)

        if fmt in ("excel", "xlsx", "xls"):
            sheet = self.config.get("sheet", 0)
            return pd.read_excel(buf, sheet_name=sheet, engine="openpyxl")

        raise ConnectorError(
            f"Unsupported S3 file format: '{fmt}'. "
            f"Supported: csv, parquet, json, excel"
        )

    @staticmethod
    def _detect_format(key: str) -> str:
        k = key.lower()
        if k.endswith(".parquet") or k.endswith(".pq"):
            return "parquet"
        if k.endswith(".json") or k.endswith(".ndjson"):
            return "json"
        if k.endswith(".xlsx") or k.endswith(".xls"):
            return "excel"
        return "csv"

    def validate_config(self) -> None:
        for required in ("bucket", "key"):
            if not self.config.get(required):
                raise ConnectorError(f"S3Connector requires '{required}' in source config.")
