"""
Excel (.xlsx / .xls) connector.

Requires: openpyxl (xlsx) or xlrd (xls).
Install with: pip install openpyxl

Config example
--------------
source:
  type: excel
  file: data/raw/customers.xlsx
  sheet: Sheet1         # optional, default 0
  header: 0             # optional, default 0
  skip_rows: 0          # optional
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional, Union

import pandas as pd

from core.connectors.base import BaseConnector, ConnectorError


class ExcelConnector(BaseConnector):
    """
    Read data from an Excel workbook (.xlsx or .xls).

    Config keys
    -----------
    file : str
        Path to the Excel file (absolute or relative to data/raw/).
    sheet : str or int, optional
        Sheet name or zero-based index. Defaults to 0 (first sheet).
    header : int, optional
        Row number to use as column headers. Defaults to 0.
    skip_rows : int, optional
        Number of rows to skip at the start. Defaults to 0.
    use_cols : str or list, optional
        Columns to parse (Excel-style range like "A:D" or list of names).
    dtype : dict, optional
        Override dtypes per column.

    Example
    -------
    source:
      type: excel
      file: orders.xlsx
      sheet: orders_2026
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()
        file_path = self._resolve_path()

        sheet: Union[str, int] = self.config.get("sheet", 0)
        header: int = int(self.config.get("header", 0))
        skip_rows: int = int(self.config.get("skip_rows", 0))
        use_cols: Optional[Any] = self.config.get("use_cols", self.config.get("usecols"))
        dtype: Optional[Dict] = self.config.get("dtype")

        try:
            df = pd.read_excel(
                file_path,
                sheet_name=sheet,
                header=header,
                skiprows=skip_rows if skip_rows else None,
                usecols=use_cols,
                dtype=dtype,
                engine="openpyxl" if str(file_path).endswith(".xlsx") else None,
            )
        except ImportError as exc:
            raise ConnectorError(
                "openpyxl is required to read .xlsx files. "
                "Install with: pip install openpyxl"
            ) from exc
        except FileNotFoundError:
            raise ConnectorError(f"Excel file not found: {file_path}")
        except Exception as exc:
            raise ConnectorError(f"Failed to read Excel '{file_path}': {exc}") from exc

        # Strip whitespace from string columns
        for col in df.select_dtypes(include="object").columns:
            df[col] = df[col].astype(str).str.strip()
            df.loc[df[col] == "nan", col] = None  # type: ignore[index]

        return df

    def validate_config(self) -> None:
        if not (self.config.get("file") or self.config.get("path")):
            raise ConnectorError("ExcelConnector requires 'file' in source config.")

    def _resolve_path(self) -> Path:
        raw = self.config.get("file") or self.config.get("path")
        p = Path(str(raw))

        if p.is_absolute():
            return p

        candidate = Path("data/raw") / p
        if candidate.exists():
            return candidate

        return p
