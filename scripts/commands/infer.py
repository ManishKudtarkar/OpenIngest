from pathlib import Path

import pandas as pd
import yaml


def run_infer(file_arg: str) -> int:
    path = _resolve_path(file_arg)
    if path is None:
        print(f"  File not found: {file_arg}")
        print("  Tip: place CSV files in data/raw/ and use the filename directly.")
        return 1

    df = pd.read_csv(path, nrows=1000)
    name = path.stem
    table = f"stg_{name}"

    # Detect likely primary key: first int/str column with "id" in name
    pk_candidates = [c for c in df.columns if "id" in c.lower() and df[c].nunique() == len(df[c].dropna())]
    primary_key = pk_candidates[:1] if pk_candidates else []

    # Detect likely incremental column: first datetime-like column
    incremental_col = None
    for col in df.columns:
        if any(k in col.lower() for k in ("time", "date", "at", "created", "updated", "timestamp")):
            sample = df[col].dropna().head(50)
            try:
                pd.to_datetime(sample, format="mixed")
                incremental_col = col
                break
            except Exception:
                pass

    # Non-null columns: columns with zero nulls in sample
    non_null = [c for c in df.columns if df[c].isna().sum() == 0]

    # Unique columns: columns where all values are unique (likely keys)
    unique_cols = [c for c in df.columns if df[c].nunique() == len(df) and "id" in c.lower()]

    strategy = "incremental" if incremental_col else "replace"

    config: dict = {
        "file": path.name,
        "staging_table": table,
        "load_strategy": strategy,
    }

    if incremental_col:
        config["incremental_column"] = incremental_col
        hash_cols = [c for c in df.columns if c != incremental_col and c not in (primary_key or [])][:6]
        if hash_cols:
            config["hash_columns"] = hash_cols

    if primary_key:
        config["primary_key"] = primary_key

    config["required_columns"] = list(df.columns)

    if non_null:
        config["non_null_columns"] = non_null

    if unique_cols:
        config["unique_columns"] = unique_cols

    output = yaml.dump({name: config}, default_flow_style=False, sort_keys=False)

    print(f"\n== Inferred config for: {path.name} {'=' * (43 - len(path.name))}\n")
    print(output)

    print("  To apply, add the above block to configs/datasets.yaml")
    print("  Or run: openingest add-dataset  to register interactively\n")

    # Offer to write directly
    answer = input("  Write to configs/datasets.yaml now? (Y/N): ").strip().lower()
    if answer != "y":
        return 0

    config_path = Path("configs/datasets.yaml")
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            existing = yaml.safe_load(f) or {}
    else:
        existing = {}

    if "datasets" not in existing or existing["datasets"] is None:
        existing["datasets"] = {}

    if name in existing["datasets"]:
        overwrite = input(f"  '{name}' already exists. Overwrite? (Y/N): ").strip().lower()
        if overwrite != "y":
            print("  Skipped.\n")
            return 0

    existing["datasets"][name] = config

    with open(config_path, "w", encoding="utf-8") as f:
        yaml.dump(existing, f, default_flow_style=False, sort_keys=False)

    print(f"  Written: configs/datasets.yaml  [{name}]\n")
    return 0


def _resolve_path(file_arg: str) -> Path | None:
    p = Path(file_arg)
    if p.exists():
        return p
    raw = Path("data/raw") / file_arg
    if raw.exists():
        return raw
    return None
