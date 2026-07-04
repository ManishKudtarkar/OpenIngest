import importlib
import os
import sys
from pathlib import Path


def _check(label: str, passed: bool, detail: str = "") -> bool:
    icon = "PASS" if passed else "FAIL"
    line = f"  [{icon}]  {label}"
    if detail:
        line += f"  ({detail})"
    print(line)
    return passed


def run_doctor() -> int:
    print("\n== OpenIngest Doctor ===========================================\n")

    failures = 0

    # Python version
    major, minor = sys.version_info[:2]
    ok = major == 3 and minor >= 10
    if not _check("Python version", ok, f"{major}.{minor} - need 3.10+"):
        failures += 1

    # Required packages
    for pkg in ["pandas", "sqlalchemy", "psycopg2", "dotenv", "yaml"]:
        found = importlib.util.find_spec(pkg) is not None
        if not _check(f"Package: {pkg}", found):
            failures += 1

    # .env file
    env_exists = Path(".env").exists()
    if not _check(".env file", env_exists, ".env not found" if not env_exists else ""):
        failures += 1

    # DATABASE_URL set
    from dotenv import load_dotenv
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not _check("DATABASE_URL set", bool(db_url), "not set in .env" if not db_url else ""):
        failures += 1

    # Database reachable
    if db_url:
        try:
            from sqlalchemy import create_engine, text
            engine = create_engine(db_url, connect_args={"connect_timeout": 5})
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            _check("Database reachable", True, db_url.split("@")[-1].split("/")[0])
        except Exception as e:
            _check("Database reachable", False, str(e)[:60])
            failures += 1
    else:
        _check("Database reachable", False, "skipped — DATABASE_URL not set")
        failures += 1

    # configs/datasets.yaml
    config_exists = Path("configs/datasets.yaml").exists()
    if not _check("configs/datasets.yaml", config_exists):
        failures += 1

    # data/raw/ directory
    raw_exists = Path("data/raw").exists()
    if not _check("data/raw/ directory", raw_exists):
        failures += 1

    # CSV files present
    if raw_exists:
        csvs = list(Path("data/raw").glob("*.csv"))
        _check("CSV files in data/raw/", bool(csvs), f"{len(csvs)} file(s) found")

    # Metadata tables
    if db_url:
        try:
            from sqlalchemy import create_engine, inspect
            engine = create_engine(db_url)
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            has_meta = "pipeline_runs" in tables
            _check(
                "Metadata tables",
                has_meta,
                "pipeline_runs found" if has_meta else "run openingest run to create them",
            )
        except Exception:
            _check("Metadata tables", False, "could not inspect database")

    print()

    if failures == 0:
        print("  All checks passed. Ready to run.\n")
        return 0
    else:
        print(f"  {failures} check(s) failed. Fix the issues above before running.\n")
        return 1
