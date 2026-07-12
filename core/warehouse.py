"""
Warehouse loader — promotes staging tables into analytics/warehouse tables.

Reads warehouse.yaml (optional) for table mappings.
Falls back to promoting all stg_* tables discovered in the database.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import inspect, text

from utils.db import get_engine

logger = logging.getLogger("openingest.warehouse")


def _load_warehouse_config() -> Dict[str, Any]:
    """Load configs/warehouse.yaml if it exists, else return empty dict."""
    try:
        from utils.config_loader import get_config_dir
        import yaml
        path = get_config_dir() / "warehouse.yaml"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
    except Exception:
        pass
    return {}


def _discover_staging_tables(engine: Any) -> List[str]:
    """Return all tables whose names start with 'stg_'."""
    inspector = inspect(engine)
    return [t for t in inspector.get_table_names() if t.startswith("stg_")]


def _promote_table(engine: Any, source: str, target: str) -> int:
    """
    Promote a staging table into a warehouse table.

    Strategy:
      1. DROP the target table if it exists.
      2. CREATE target AS SELECT * FROM source.

    Returns row count loaded.
    """
    with engine.begin() as conn:
        conn.execute(text(f'DROP TABLE IF EXISTS "{target}";'))
        conn.execute(text(f'CREATE TABLE "{target}" AS SELECT * FROM "{source}";'))
        result = conn.execute(text(f'SELECT COUNT(*) FROM "{target}";'))
        row = result.fetchone()
        return int(row[0]) if row else 0


def load_warehouse(table_map: Optional[Dict[str, str]] = None) -> None:
    """
    Promote staging tables into warehouse/analytics tables.

    Parameters
    ----------
    table_map : dict, optional
        Explicit mapping of {staging_table: warehouse_table}.
        If not provided, reads from warehouse.yaml or auto-discovers stg_* tables.

    Example warehouse.yaml
    ----------------------
    tables:
      stg_air_full_raw: air_full_raw
      stg_air_clean: air_clean
    """
    engine = get_engine()

    # Resolve table map
    if table_map is None:
        cfg = _load_warehouse_config()
        table_map = cfg.get("tables") or {}

    if not table_map:
        # Auto-discover all stg_* staging tables
        staging = _discover_staging_tables(engine)
        table_map = {t: t[4:] for t in staging}  # strip "stg_" prefix

    if not table_map:
        print("Warehouse: no staging tables found to promote.")
        return

    print(f"Warehouse loading started — {len(table_map)} table(s)")

    total_rows = 0
    for source, target in table_map.items():
        try:
            rows = _promote_table(engine, source, target)
            total_rows += rows
            print(f"  ✓  {source}  →  {target}  ({rows:,} rows)")
            logger.info("Promoted %s → %s (%d rows)", source, target, rows)
        except Exception as exc:
            print(f"  ✗  {source}  →  {target}  FAILED: {exc}")
            logger.error("Failed to promote %s → %s: %s", source, target, exc)

    print(f"Warehouse loading completed — {total_rows:,} total rows promoted")
