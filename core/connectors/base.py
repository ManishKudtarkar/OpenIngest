"""
Base connector interface.

All connectors must implement `read() -> pd.DataFrame`.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict

import pandas as pd


class BaseConnector(ABC):
    """
    Abstract base class for all OpenIngest source connectors.

    Subclass this and implement `read()` to create a custom connector.
    Register it with:

        ConnectorRegistry.register("my_type", MyConnector)

    Then use it in datasets.yaml:

        source:
          type: my_type
          ...
    """

    def __init__(self, source_config: Dict[str, Any]) -> None:
        self.config = source_config

    @abstractmethod
    def read(self) -> pd.DataFrame:
        """
        Load data from the source and return a DataFrame.
        Raise ConnectorError on any failure.
        """
        ...

    def validate_config(self) -> None:
        """
        Optional: validate required config keys before read().
        Override to add connector-specific checks.
        """
        pass


class ConnectorError(Exception):
    """Raised when a connector fails to read data."""
    pass
