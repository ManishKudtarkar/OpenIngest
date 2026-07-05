"""
ConnectorRegistry — maps source type strings to connector classes.

Built-in connectors are registered automatically on import.
Third-party plugins call ConnectorRegistry.register() to add theirs.

Usage
-----
    from core.connectors.registry import ConnectorRegistry
    import pandas as pd

    # Install a custom connector:
    ConnectorRegistry.register("my_db", MyDatabaseConnector)

    # Resolve and use:
    connector = ConnectorRegistry.get("s3", source_config)
    df: pd.DataFrame = connector.read()
"""

from __future__ import annotations

from typing import Any, Dict, Type, TYPE_CHECKING

if TYPE_CHECKING:
    from core.connectors.base import BaseConnector


class ConnectorRegistry:
    _registry: Dict[str, Type["BaseConnector"]] = {}

    @classmethod
    def register(cls, name: str, connector_class: Type["BaseConnector"]) -> None:
        """Register a connector class under a type name."""
        cls._registry[name.lower()] = connector_class

    @classmethod
    def get(cls, name: str, source_config: Dict[str, Any]) -> "BaseConnector":
        """
        Instantiate and return a connector for the given source type.
        Raises ValueError if no connector is registered for the type.
        """
        key = name.lower()
        if key not in cls._registry:
            available = sorted(cls._registry.keys())
            raise ValueError(
                f"No connector registered for source type '{name}'. "
                f"Available: {available}. "
                f"Install a plugin with: pip install openingest-{name}"
            )
        return cls._registry[key](source_config)

    @classmethod
    def list_connectors(cls) -> list[str]:
        """Return sorted list of all registered connector type names."""
        return sorted(cls._registry.keys())

    @classmethod
    def is_registered(cls, name: str) -> bool:
        return name.lower() in cls._registry


def _auto_register_builtins() -> None:
    """Register all built-in connectors at import time."""
    from core.connectors.formats.csv_connector import CsvConnector
    from core.connectors.formats.excel_connector import ExcelConnector
    from core.connectors.formats.json_connector import JsonConnector
    from core.connectors.formats.parquet_connector import ParquetConnector
    from core.connectors.cloud.s3_connector import S3Connector
    from core.connectors.cloud.azure_connector import AzureBlobConnector
    from core.connectors.cloud.gcs_connector import GCSConnector
    from core.connectors.api.rest_connector import RestApiConnector

    ConnectorRegistry.register("csv",     CsvConnector)
    ConnectorRegistry.register("excel",   ExcelConnector)
    ConnectorRegistry.register("xlsx",    ExcelConnector)
    ConnectorRegistry.register("json",    JsonConnector)
    ConnectorRegistry.register("parquet", ParquetConnector)
    ConnectorRegistry.register("s3",      S3Connector)
    ConnectorRegistry.register("azure",   AzureBlobConnector)
    ConnectorRegistry.register("gcs",     GCSConnector)
    ConnectorRegistry.register("rest",    RestApiConnector)
    ConnectorRegistry.register("api",     RestApiConnector)


_auto_register_builtins()
