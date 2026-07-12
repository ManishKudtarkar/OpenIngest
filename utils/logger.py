"""
Centralised logging configuration for OpenIngest.

Usage
-----
    from utils.logger import get_logger
    logger = get_logger(__name__)
    logger.info("Pipeline started")

Log level is controlled by the LOG_LEVEL environment variable.
Defaults to INFO. Valid values: DEBUG, INFO, WARNING, ERROR, CRITICAL.
"""

from __future__ import annotations

import logging
import os
import sys


def _configure_root_logger() -> None:
    """Set up the root openingest logger once at import time."""
    level_name = os.environ.get("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    root = logging.getLogger("openingest")

    if root.handlers:
        return  # Already configured — don't add duplicate handlers

    root.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    formatter = logging.Formatter(
        fmt="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    root.addHandler(handler)


_configure_root_logger()


def get_logger(name: str) -> logging.Logger:
    """
    Return a logger scoped under the openingest namespace.

    Parameters
    ----------
    name : str
        Typically ``__name__`` of the calling module.
        'openingest.' is prepended if not already present.
    """
    if not name.startswith("openingest"):
        name = f"openingest.{name}"
    return logging.getLogger(name)
