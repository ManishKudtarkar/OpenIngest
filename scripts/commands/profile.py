from pathlib import Path

import pandas as pd


def run_profile(file_arg: str) -> int:
    path = _resolve_path(file_arg)
    if path is None:
        print(f"  File not found: {file_arg}")
        print("  Tip: place CSV files in data/raw/ and use the filename directly.")
        return 1

    df = pd.read_csv(path)
    rows, cols = df.shape

    print(f"\n== Profile: {path.name} {'=' * (55 - len(path.name))}\n")
    print(f"  Rows    : {rows:,}")
    print(f"  Columns : {cols}")
    print(f"  Size    : {path.stat().st_size / 1024:.1f} KB\n")

    # Column types
    print("  COLUMNS")
    print("  " + "-" * 50)
    for col in df.columns:
        dtype = _friendly_dtype(df[col])
        print(f"  {col:<30} {dtype}")

    # Missing values
    print("\n  MISSING VALUES")
    print("  " + "-" * 50)
    has_missing = False
    for col in df.columns:
        null_count = int(df[col].isna().sum())
        if null_count > 0:
            pct = null_count / rows * 100
            print(f"  {col:<30} {null_count:>6,}  ({pct:.1f}%)")
            has_missing = True
    if not has_missing:
        print("  No missing values.")

    # Duplicates
    print("\n  DUPLICATES")
    print("  " + "-" * 50)
    total_dupes = int(df.duplicated().sum())
    print(f"  Full row duplicates : {total_dupes:,}")

    # Per-column duplicate check for likely key columns
    key_candidates = [c for c in df.columns if any(k in c.lower() for k in ("id", "key", "code", "email"))]
    for col in key_candidates[:5]:
        dupes = int(df[col].duplicated().sum())
        print(f"  {col:<30} {dupes:>6,} duplicate(s)")

    # Numeric summary
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    if numeric_cols:
        print("\n  NUMERIC SUMMARY")
        print("  " + "-" * 50)
        for col in numeric_cols[:8]:
            s = df[col].dropna()
            print(
                f"  {col:<30} "
                f"min={s.min():<12.2f} "
                f"max={s.max():<12.2f} "
                f"mean={s.mean():.2f}"
            )

    print()
    return 0


def _resolve_path(file_arg: str) -> Path | None:
    p = Path(file_arg)
    if p.exists():
        return p
    raw = Path("data/raw") / file_arg
    if raw.exists():
        return raw
    return None


def _friendly_dtype(series: pd.Series) -> str:
    dtype = str(series.dtype)
    if "int" in dtype:
        return "INTEGER"
    if "float" in dtype:
        return "FLOAT"
    if "bool" in dtype:
        return "BOOLEAN"
    if "datetime" in dtype:
        return "TIMESTAMP"
    # Try to detect dates in object columns
    if dtype == "object":
        sample = series.dropna().head(100)
        try:
            pd.to_datetime(sample, format="mixed")
            return "DATE/TIMESTAMP"
        except Exception:
            pass
        return "TEXT"
    return dtype.upper()
