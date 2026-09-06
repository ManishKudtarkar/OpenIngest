"""
Database engine factory.

Uses a module-level singleton so all callers share one connection pool.
Call `reset_engine()` to force a fresh engine (e.g. after a connection failure).
"""
from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from utils.config import get_database_url

_engine: Engine | None = None


def get_engine() -> Engine:
    """Return the shared SQLAlchemy engine, creating it on first call."""
    global _engine
    if _engine is None:
        _engine = create_engine(
            get_database_url(),
            pool_pre_ping=True,       # auto-detect stale connections
            pool_recycle=1800,        # recycle after 30 min
            connect_args={"connect_timeout": 10},
        )
    return _engine


def reset_engine() -> None:
    """Dispose the current engine and clear the singleton so the next call rebuilds it."""
    global _engine
    if _engine is not None:
        _engine.dispose()
        _engine = None
