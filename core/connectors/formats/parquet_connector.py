"""
Parquet connector — reads local Parquet files.

Requires: pyarrow or fastparquet.
Install with: pip install pyarrow

Config example
--------------
source:
  type: parquet
  file: data/raw/orders.parquet
  columns: [order_id, customer_id, total_usd]  # optional column subset
  filters: [["total_usd", ">", 0]]              # optional predicate pushdown
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd

from core.connectors.base import BaseConnector, ConnectorError


class ParquetConnector(BaseConnector):
    """
    Read data from a Parquet file.

    Config keys
    -----------
    file : str
        Path to the Parquet file.
    columns : list of str, optional
        Column names to read (projection pushdown). Reads all by default.
    filters : list, optional
        Predicate pushdown filters in pyarrow format.
        Example: [["total_usd", ">", 0], ["country", "==", "US"]]
    engine : str, optional
        Parquet engine: 'pyarrow' (default) or 'fastparquet'.

    Example
    -------
    source:
      type: parquet
      file: orders.parquet
      columns: [order_id, customer_id, total_usd]
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()
        file_path = self._resolve_path()

        columns: Optional[List[str]] = self.config.get("columns")
        filters: Optional[Any] = self.config.get("filters")
        engine: str = self.config.get("engine", "pyarrow")

        kwargs: Dict[str, Any] = {"engine": engine}
        if columns:
            kwargs["columns"] = columns
        if filters:
            kwargs["filters"] = filters

        try:
            df = pd.read_parquet(file_path, **kwargs)
            return df
        except ImportError as exc:
            raise ConnectorError(
                "pyarrow is required to read Parquet files. "
                "Install with: pip install pyarrow"
            ) from exc
        except FileNotFoundError:
            raise ConnectorError(f"Parquet file not found: {file_path}")
        except Exception as exc:
            raise ConnectorError(f"Failed to read Parquet '{file_path}': {exc}") from exc

    def validate_config(self) -> None:
        if not (self.config.get("file") or self.config.get("path")):
            raise ConnectorError("ParquetConnector requires 'file' in source config.")

    def _resolve_path(self) -> Path:
        raw = self.config.get("file") or self.config.get("path")
        p = Path(str(raw))

        if p.is_absolute():
            return p

        candidate = Path("data/raw") / p
        if candidate.exists():
            return candidate

        return p
