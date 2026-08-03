"""
OpenIngest connector package.

Exposes the ConnectorRegistry and all built-in source connectors.
"""

from core.connectors.base import BaseConnector
from core.connectors.registry import ConnectorRegistry

__all__ = ["BaseConnector", "ConnectorRegistry"]
