"""
FTP source connector.

Downloads a file from an FTP server and returns a DataFrame.

Requires: No extra dependency (ftplib is in Python stdlib)

Config example
--------------
source:
  type: ftp
  host: ${FTP_HOST}
  port: 21
  username: ${FTP_USER}
  password: ${FTP_PASSWORD}
  remote_path: /data/exports/orders.csv
"""

from __future__ import annotations

import ftplib
import io
import os

import pandas as pd

from core.connectors.base import BaseConnector, ConnectorError


def _resolve(value: str) -> str:
    if isinstance(value, str) and value.startswith("${") and value.endswith("}"):
        var = value[2:-1]
        resolved = os.environ.get(var)
        if resolved is None:
            raise ConnectorError(
                f"Environment variable '{var}' is not set. "
                f"Add it to your .env file: {var}=..."
            )
        return resolved
    return str(value) if value is not None else value


def _detect_format(path: str) -> str:
    p = path.lower()
    if p.endswith((".parquet", ".pq")):
        return "parquet"
    if p.endswith((".json", ".ndjson")):
        return "json"
    if p.endswith((".xlsx", ".xls")):
        return "excel"
    return "csv"


class FTPConnector(BaseConnector):
    """
    Download a file from an FTP server into a DataFrame.

    Config keys
    -----------
    host : str
        FTP server hostname or ${ENV_VAR}.
    port : int, optional
        FTP port. Defaults to 21.
    username : str
        FTP username or ${ENV_VAR}.
    password : str
        FTP password or ${ENV_VAR}.
    remote_path : str
        Full path to the remote file.
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()

        host = _resolve(self.config["host"])
        port = int(_resolve(str(self.config.get("port", 21))))
        username = _resolve(self.config["username"])
        password = _resolve(self.config["password"])
        remote_path: str = self.config["remote_path"]

        buf = io.BytesIO()

        try:
            ftp = ftplib.FTP()
            ftp.connect(host=host, port=port, timeout=30)
            ftp.login(user=username, passwd=password)
        except Exception as exc:
            raise ConnectorError(
                f"Failed to connect to FTP {host}:{port}: {exc}"
            ) from exc

        try:
            ftp.retrbinary(f"RETR {remote_path}", buf.write)
            buf.seek(0)
        except ftplib.error_perm as exc:
            raise ConnectorError(
                f"Remote file not found on FTP {host}: {remote_path} — {exc}"
            ) from exc
        except Exception as exc:
            raise ConnectorError(
                f"Failed to download {remote_path} from FTP {host}:{port}: {exc}"
            ) from exc
        finally:
            ftp.quit()

        return self._parse(buf, remote_path)

    def _parse(self, buf: io.BytesIO, remote_path: str) -> pd.DataFrame:
        fmt = _detect_format(remote_path)
        if fmt == "csv":
            return pd.read_csv(buf)
        if fmt == "json":
            return pd.read_json(buf)
        if fmt == "parquet":
            return pd.read_parquet(buf)
        if fmt == "excel":
            return pd.read_excel(buf, engine="openpyxl")
        raise ConnectorError(f"Unsupported file format for FTP download: {remote_path}")

    def validate_config(self) -> None:
        for key in ("host", "username", "password", "remote_path"):
            if not self.config.get(key):
                raise ConnectorError(f"FTPConnector requires '{key}' in source config.")
