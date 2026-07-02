import pandas as pd

from utils.db import get_engine


engine = get_engine()

print("\n")
print("=" * 80)
print("PIPELINE RUN HISTORY")
print("=" * 80)

runs = pd.read_sql(
    "SELECT * FROM pipeline_runs ORDER BY started_at DESC;",
    engine,
)

print(runs)

print("\n")
print("=" * 80)
print("DATASET RUN HISTORY")
print("=" * 80)

datasets = pd.read_sql(
    """
    SELECT *
    FROM pipeline_dataset_runs
    ORDER BY loaded_at DESC;
    """,
    engine,
)

print(datasets)