"""Tests for local file connectors — CSV, JSON, Parquet, Excel."""

from __future__ import annotations

import io
import json
import tempfile
from pathlib import Path

import pandas as pd
import pytest

from core.connectors.base import ConnectorError
from core.connectors.formats.csv_connector import CsvConnector
from core.connectors.formats.json_connector import JsonConnector
from core.connectors.formats.parquet_connector import ParquetConnector


# ── CSV ───────────────────────────────────────────────────────────────────────

def test_csv_reads_file(tmp_path: Path) -> None:
    f = tmp_path / "test.csv"
    f.write_text("id,name\n1,Alice\n2,Bob\n")
    connector = CsvConnector({"file": str(f)})
    df = connector.read()
    assert list(df.columns) == ["id", "name"]
    assert len(df) == 2


def test_csv_missing_file_raises(tmp_path: Path) -> None:
    connector = CsvConnector({"file": str(tmp_path / "missing.csv")})
    with pytest.raises(ConnectorError, match="not found"):
        connector.read()


def test_csv_missing_file_key_raises() -> None:
    connector = CsvConnector({})
    with pytest.raises(ConnectorError, match="requires 'file'"):
        connector.read()


def test_csv_custom_separator(tmp_path: Path) -> None:
    f = tmp_path / "test.csv"
    f.write_text("id|name\n1|Alice\n2|Bob\n")
    connector = CsvConnector({"file": str(f), "separator": "|"})
    df = connector.read()
    assert list(df.columns) == ["id", "name"]


# ── JSON ──────────────────────────────────────────────────────────────────────

def test_json_reads_records(tmp_path: Path) -> None:
    f = tmp_path / "test.json"
    data = [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
    f.write_text(json.dumps(data))
    connector = JsonConnector({"file": str(f)})
    df = connector.read()
    assert list(df.columns) == ["id", "name"]
    assert len(df) == 2


def test_json_missing_file_raises(tmp_path: Path) -> None:
    connector = JsonConnector({"file": str(tmp_path / "missing.json")})
    with pytest.raises(ConnectorError):
        connector.read()


def test_json_missing_file_key_raises() -> None:
    connector = JsonConnector({})
    with pytest.raises(ConnectorError, match="requires 'file'"):
        connector.read()


# ── Parquet ───────────────────────────────────────────────────────────────────

def test_parquet_reads_file(tmp_path: Path) -> None:
    pytest.importorskip("pyarrow")
    f = tmp_path / "test.parquet"
    expected = pd.DataFrame({"id": [1, 2], "val": [10.0, 20.0]})
    expected.to_parquet(f, index=False)
    connector = ParquetConnector({"file": str(f)})
    df = connector.read()
    assert list(df.columns) == ["id", "val"]
    assert len(df) == 2


def test_parquet_missing_file_raises(tmp_path: Path) -> None:
    pytest.importorskip("pyarrow")
    connector = ParquetConnector({"file": str(tmp_path / "missing.parquet")})
    with pytest.raises(ConnectorError):
        connector.read()


def test_parquet_missing_file_key_raises() -> None:
    pytest.importorskip("pyarrow")
    connector = ParquetConnector({})
    with pytest.raises(ConnectorError, match="requires 'file'"):
        connector.read()
