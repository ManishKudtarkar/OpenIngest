"""CSV connector — wraps the existing CSV read path."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict

import pandas as pd

from core.connectors.base import BaseConnector, ConnectorError


class CsvConnector(BaseConnector):
    """
    Read a CSV file from the local filesystem.

    Config keys
    -----------
    file : str
        Filename (resolved against data/raw/) or absolute path.
    encoding : str, optional
        File encoding. Defaults to 'utf-8'.
    separator : str, optional
        Column separator. Defaults to ','.

    Example
    -------
    source:
      type: csv
      file: customers.csv
    """

    def read(self) -> pd.DataFrame:
        file_path = self._resolve_path()
        encoding = self.config.get("encoding", "utf-8")
        sep = self.config.get("separator", self.config.get("sep", ","))

        try:
            return pd.read_csv(file_path, encoding=encoding, sep=sep)
        except FileNotFoundError:
            raise ConnectorError(f"CSV file not found: {file_path}")
        except Exception as exc:
            raise ConnectorError(f"Failed to read CSV '{file_path}': {exc}") from exc

    def _resolve_path(self) -> Path:
        raw = self.config.get("file") or self.config.get("path")
        if not raw:
            raise ConnectorError("CsvConnector requires 'file' in source config.")

        p = Path(raw)
        if p.is_absolute():
            return p

        # Relative → try data/raw/ first, then cwd
        candidate = Path("data/raw") / p
        if candidate.exists():
            return candidate

        return p
