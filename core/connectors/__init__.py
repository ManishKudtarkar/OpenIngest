"""
OpenIngest connector package.

Exposes the ConnectorRegistry and all built-in source connectors.
"""

from core.connectors.registry import ConnectorRegistry
from core.connectors.base import BaseConnector

__all__ = ["ConnectorRegistry", "BaseConnector"]
