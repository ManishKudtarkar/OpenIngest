"""
JSON connector — reads local JSON files into a DataFrame.

Supports flat JSON arrays, newline-delimited JSON (NDJSON), and nested
objects via a configurable record path.

Config example
--------------
# Flat JSON array
source:
  type: json
  file: orders.json

# Nested JSON with record path
source:
  type: json
  file: api_response.json
  record_path: data.orders      # dot-separated path to the array

# Newline-delimited JSON (one JSON object per line)
source:
  type: json
  file: events.ndjson
  lines: true
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd

from core.connectors.base import BaseConnector, ConnectorError


def _get_nested(obj: Any, path: str) -> Any:
    """Traverse dot-separated path in a nested dict."""
    parts = path.split(".")
    current = obj
    for part in parts:
        if isinstance(current, dict):
            current = current.get(part)
        elif isinstance(current, list):
            # Path refers to a key inside list items — not supported at this level
            break
        else:
            return None
    return current


class JsonConnector(BaseConnector):
    """
    Read data from a JSON file.

    Config keys
    -----------
    file : str
        Path to the JSON file.
    record_path : str, optional
        Dot-separated path to the array of records inside the JSON structure.
        Example: "data.items" for {"data": {"items": [...]}}.
    lines : bool, optional
        If True, reads newline-delimited JSON (one object per line). Default False.
    encoding : str, optional
        File encoding. Default 'utf-8'.
    orient : str, optional
        Pandas orient hint when using pd.read_json directly (records, index, split, etc.).

    Example
    -------
    source:
      type: json
      file: customers.json
      record_path: results
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()
        file_path = self._resolve_path()

        encoding: str = self.config.get("encoding", "utf-8")
        lines: bool = bool(self.config.get("lines", False))
        record_path: Optional[str] = self.config.get("record_path")
        orient: Optional[str] = self.config.get("orient")

        try:
            if lines:
                # Newline-delimited JSON — one object per line
                df = pd.read_json(file_path, lines=True, encoding=encoding)
                return df

            if record_path:
                # Load full JSON, navigate to nested array
                import json

                with open(file_path, "r", encoding=encoding) as f:
                    raw = json.load(f)

                records = _get_nested(raw, record_path)
                if records is None:
                    raise ConnectorError(
                        f"record_path '{record_path}' not found in JSON. "
                        f"Top-level keys: {list(raw.keys()) if isinstance(raw, dict) else 'N/A'}"
                    )
                if not isinstance(records, list):
                    raise ConnectorError(
                        f"record_path '{record_path}' did not resolve to a list. "
                        f"Got: {type(records).__name__}"
                    )

                df = pd.json_normalize(records)
                return df

            # Standard read
            kwargs: Dict[str, Any] = {"encoding": encoding}
            if orient:
                kwargs["orient"] = orient

            df = pd.read_json(file_path, **kwargs)
            return df

        except FileNotFoundError:
            raise ConnectorError(f"JSON file not found: {file_path}")
        except ConnectorError:
            raise
        except Exception as exc:
            raise ConnectorError(f"Failed to read JSON '{file_path}': {exc}") from exc

    def validate_config(self) -> None:
        if not (self.config.get("file") or self.config.get("path")):
            raise ConnectorError("JsonConnector requires 'file' in source config.")

    def _resolve_path(self) -> Path:
        raw = self.config.get("file") or self.config.get("path")
        p = Path(str(raw))

        if p.is_absolute():
            return p

        candidate = Path("data/raw") / p
        if candidate.exists():
            return candidate

        return p
