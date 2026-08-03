"""Tests for ConnectorRegistry — registration, lookup, and error handling."""

from __future__ import annotations

import pandas as pd
import pytest

from core.connectors.base import BaseConnector
from core.connectors.registry import ConnectorRegistry

# ── built-in registrations ────────────────────────────────────────────────────

EXPECTED_BUILTINS = [
    "api", "azure", "csv", "excel", "ftp", "gcs",
    "google_sheets", "hubspot", "json", "mongo", "mongodb",
    "mysql", "parquet", "postgres", "postgresql",
    "rest", "s3", "salesforce", "sftp", "stripe", "xlsx",
]

def test_all_builtin_connectors_registered() -> None:
    registered = ConnectorRegistry.list_connectors()
    for name in EXPECTED_BUILTINS:
        assert name in registered, f"Expected '{name}' to be registered"


def test_total_connector_count() -> None:
    assert len(ConnectorRegistry.list_connectors()) >= 21


def test_is_registered_true() -> None:
    assert ConnectorRegistry.is_registered("s3") is True
    assert ConnectorRegistry.is_registered("csv") is True
    assert ConnectorRegistry.is_registered("postgresql") is True


def test_is_registered_false() -> None:
    assert ConnectorRegistry.is_registered("oracle") is False
    assert ConnectorRegistry.is_registered("db2") is False


def test_is_registered_case_insensitive() -> None:
    assert ConnectorRegistry.is_registered("S3") is True
    assert ConnectorRegistry.is_registered("CSV") is True


# ── custom connector registration ─────────────────────────────────────────────

class DummyConnector(BaseConnector):
    def read(self) -> pd.DataFrame:
        return pd.DataFrame({"test": [1, 2, 3]})


def test_register_custom_connector() -> None:
    ConnectorRegistry.register("dummy_test", DummyConnector)
    assert ConnectorRegistry.is_registered("dummy_test")


def test_get_custom_connector_returns_instance() -> None:
    ConnectorRegistry.register("dummy_get", DummyConnector)
    connector = ConnectorRegistry.get("dummy_get", {})
    assert isinstance(connector, DummyConnector)


def test_custom_connector_read_works() -> None:
    ConnectorRegistry.register("dummy_read", DummyConnector)
    connector = ConnectorRegistry.get("dummy_read", {})
    df = connector.read()
    assert isinstance(df, pd.DataFrame)
    assert list(df.columns) == ["test"]
    assert len(df) == 3


# ── error cases ───────────────────────────────────────────────────────────────

def test_get_unregistered_raises_value_error() -> None:
    with pytest.raises(ValueError, match="No connector registered"):
        ConnectorRegistry.get("not_a_real_connector_xyz", {})


def test_get_error_message_lists_available() -> None:
    with pytest.raises(ValueError, match="Available:"):
        ConnectorRegistry.get("no_such_type_abc", {})


# ── list_connectors returns sorted list ───────────────────────────────────────

def test_list_connectors_is_sorted() -> None:
    result = ConnectorRegistry.list_connectors()
    assert result == sorted(result)
