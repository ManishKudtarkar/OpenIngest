"""
MySQL source connector.

Reads data from a MySQL database via a SQL query or table name.

Requires: pymysql
Install with: pip install openingest[mysql]

Config example
--------------
source:
  type: mysql
  host: ${MYSQL_HOST}
  port: 3306
  database: ${MYSQL_DATABASE}
  username: ${MYSQL_USER}
  password: ${MYSQL_PASSWORD}
  query: "SELECT * FROM orders WHERE status = 'active'"
  # OR
  table: orders
  chunk_size: 10000   # optional
"""

from __future__ import annotations

import os
from typing import List, Optional

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


class MySQLConnector(BaseConnector):
    """
    Read from a MySQL database into a DataFrame.

    Config keys
    -----------
    host : str
        Database host or ${ENV_VAR}.
    port : int, optional
        Database port. Defaults to 3306.
    database : str
        Database name or ${ENV_VAR}.
    username : str
        Database username or ${ENV_VAR}.
    password : str
        Database password or ${ENV_VAR}.
    query : str, optional
        Full SQL SELECT query to execute.
    table : str, optional
        Table name — executes SELECT * FROM <table>. Required if query not set.
    chunk_size : int, optional
        Fetch rows in batches of this size and concatenate.
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            import pymysql  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "pymysql is required for MySQL connectors. "
                "Install with: pip install openingest[mysql]"
            )

        host = _resolve(self.config["host"])
        port = int(_resolve(str(self.config.get("port", 3306))))
        database = _resolve(self.config["database"])
        username = _resolve(self.config["username"])
        password = _resolve(self.config["password"])

        query = self.config.get("query") or f"SELECT * FROM `{self.config['table']}`"
        chunk_size: Optional[int] = self.config.get("chunk_size")

        try:
            conn = pymysql.connect(
                host=host,
                port=port,
                database=database,
                user=username,
                password=password,
                cursorclass=pymysql.cursors.DictCursor,
            )
        except Exception as exc:
            raise ConnectorError(
                f"Failed to connect to MySQL at {host}:{port}/{database}: {exc}"
            ) from exc

        try:
            if chunk_size:
                chunks: List[pd.DataFrame] = []
                for chunk in pd.read_sql(query, conn, chunksize=chunk_size):
                    chunks.append(chunk)
                return pd.concat(chunks, ignore_index=True) if chunks else pd.DataFrame()
            else:
                return pd.read_sql(query, conn)
        except Exception as exc:
            raise ConnectorError(
                f"Failed to execute query on {host}:{port}/{database}: {exc}"
            ) from exc
        finally:
            conn.close()

    def validate_config(self) -> None:
        for key in ("host", "database", "username", "password"):
            if not self.config.get(key):
                raise ConnectorError(f"MySQLConnector requires '{key}' in source config.")
        if not self.config.get("query") and not self.config.get("table"):
            raise ConnectorError(
                "MySQLConnector requires either 'query' or 'table' in source config."
            )
