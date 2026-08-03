"""
SFTP source connector.

Downloads a file from an SFTP server and returns a DataFrame.

Requires: paramiko
Install with: pip install openingest[sftp]

Config example
--------------
source:
  type: sftp
  host: ${SFTP_HOST}
  port: 22
  username: ${SFTP_USER}
  password: ${SFTP_PASSWORD}
  remote_path: /data/exports/orders.csv
  # OR use a private key:
  private_key_path: ~/.ssh/id_rsa
"""

from __future__ import annotations

import io
import os
from pathlib import Path

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
    if p.endswith(".parquet") or p.endswith(".pq"):
        return "parquet"
    if p.endswith(".json") or p.endswith(".ndjson"):
        return "json"
    if p.endswith(".xlsx") or p.endswith(".xls"):
        return "excel"
    return "csv"


class SFTPConnector(BaseConnector):
    """
    Download a file from an SFTP server into a DataFrame.

    Config keys
    -----------
    host : str
        SFTP server hostname or ${ENV_VAR}.
    port : int, optional
        SFTP port. Defaults to 22.
    username : str
        SFTP username or ${ENV_VAR}.
    password : str, optional
        SFTP password or ${ENV_VAR}. Either password or private_key_path required.
    private_key_path : str, optional
        Path to SSH private key file or ${ENV_VAR}.
    remote_path : str
        Full path to the remote file.
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            import paramiko  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "paramiko is required for SFTP connectors. "
                "Install with: pip install openingest[sftp]"
            )

        host = _resolve(self.config["host"])
        port = int(_resolve(str(self.config.get("port", 22))))
        username = _resolve(self.config["username"])
        remote_path: str = self.config["remote_path"]

        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            connect_kwargs: dict = {"hostname": host, "port": port, "username": username}

            if self.config.get("private_key_path"):
                key_path = Path(_resolve(self.config["private_key_path"])).expanduser()
                connect_kwargs["pkey"] = paramiko.RSAKey.from_private_key_file(str(key_path))
            elif self.config.get("password"):
                connect_kwargs["password"] = _resolve(self.config["password"])

            ssh.connect(**connect_kwargs)
        except Exception as exc:
            raise ConnectorError(
                f"Failed to connect to SFTP {host}:{port}: {exc}"
            ) from exc

        try:
            sftp = ssh.open_sftp()
            buf = io.BytesIO()
            sftp.getfo(remote_path, buf)
            buf.seek(0)
        except FileNotFoundError:
            raise ConnectorError(
                f"Remote file not found on SFTP {host}: {remote_path}"
            )
        except Exception as exc:
            raise ConnectorError(
                f"Failed to download {remote_path} from SFTP {host}:{port}: {exc}"
            ) from exc
        finally:
            ssh.close()

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
        raise ConnectorError(f"Unsupported file format for SFTP download: {remote_path}")

    def validate_config(self) -> None:
        for key in ("host", "username", "remote_path"):
            if not self.config.get(key):
                raise ConnectorError(f"SFTPConnector requires '{key}' in source config.")
        if not self.config.get("password") and not self.config.get("private_key_path"):
            raise ConnectorError(
                "SFTPConnector requires either 'password' or 'private_key_path' in source config."
            )
