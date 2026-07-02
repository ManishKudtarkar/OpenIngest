from pathlib import Path
from sqlalchemy import text

from utils.db import get_engine


def run_sql_file(file_path: str):
    """
    Execute a SQL script against the configured database.
    """

    engine = get_engine()

    sql = Path(file_path).read_text(encoding="utf-8")

    with engine.begin() as conn:
        conn.execute(text(sql))

    print(f"✓ Executed: {file_path}")


def setup_database():

    sql_files = [
        "sql/create_tables.sql",
        "sql/create_metadata_tables.sql",
    ]

    print("=" * 70)
    print("OPENINGEST DATABASE INITIALIZATION")
    print("=" * 70)

    for sql_file in sql_files:
        run_sql_file(sql_file)

    print("\n✓ Database setup completed successfully.")


if __name__ == "__main__":
    setup_database()