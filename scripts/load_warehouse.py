import os
import sys
from pathlib import Path

from sqlalchemy import text

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from utils.db import get_engine


def run_sql_file(file_path: str):
    engine = get_engine()
    sql = Path(file_path).read_text(encoding="utf-8")
    with engine.begin() as conn:
        conn.execute(text(sql))
    print(f"Executed SQL file: {file_path}")

def load_warehouse_and_analytics():
    run_sql_file("/opt/airflow/sql/warehouse_queries.sql")
    run_sql_file("/opt/airflow/sql/analytics_queries.sql")

if __name__ == "__main__":
    load_warehouse_and_analytics()