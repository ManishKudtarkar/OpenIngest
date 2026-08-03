"""
OpenIngest Transformation Engine (v3.0).

Applies a sequence of declarative transform steps to a DataFrame after ingestion
and before it is written to the staging table.

Transform steps are defined in datasets.yaml under a `transforms:` list:

    transforms:
      - type: rename
        columns:
          old_name: new_name
          another_old: another_new

      - type: cast
        columns:
          amount: float
          created_at: datetime

      - type: filter
        expression: "amount > 0"

      - type: derive
        columns:
          revenue_usd: "price * quantity"

      - type: aggregate
        group_by: [region, product]
        aggregations:
          revenue_usd: sum
          quantity: sum

      - type: python
        function: my_package.transforms.normalize
        # OR
        inline: |
          df = df.dropna(subset=["email"])
          df["email"] = df["email"].str.lower()

Supported step types: rename, cast, filter, derive, aggregate, python
"""

from __future__ import annotations

import importlib
from typing import Any, Dict, List, Optional

import pandas as pd


class TransformError(Exception):
    """Raised when a transform step fails."""
    pass


_SUPPORTED_TYPES = ("rename", "cast", "filter", "derive", "aggregate", "python")

_CAST_MAP: Dict[str, Any] = {
    "int":      "Int64",       # nullable integer
    "float":    float,
    "str":      str,
    "bool":     bool,
    "date":     None,          # handled specially
    "datetime": None,          # handled specially
}

_SUPPORTED_AGGS = ("sum", "mean", "min", "max", "count", "first", "last")


# ─────────────────────────────────────────────────────────────────────────────
# Individual step handlers
# ─────────────────────────────────────────────────────────────────────────────

def _apply_rename(df: pd.DataFrame, step: Dict[str, Any]) -> pd.DataFrame:
    columns: Dict[str, str] = step.get("columns") or {}
    for src in columns:
        if src not in df.columns:
            raise TransformError(
                f"rename: column '{src}' not found in DataFrame. "
                f"Available columns: {list(df.columns)}"
            )
    return df.rename(columns=columns)


def _apply_cast(df: pd.DataFrame, step: Dict[str, Any]) -> pd.DataFrame:
    columns: Dict[str, Any] = step.get("columns") or {}
    result = df.copy()
    for col, target_type in columns.items():
        if col not in result.columns:
            raise TransformError(
                f"cast: column '{col}' not found in DataFrame. "
                f"Available columns: {list(result.columns)}"
            )
        target_type = str(target_type).lower()
        try:
            if target_type == "date":
                fmt = (step.get("formats") or {}).get(col)
                result[col] = pd.to_datetime(result[col], format=fmt, errors="coerce").dt.date
            elif target_type == "datetime":
                fmt = (step.get("formats") or {}).get(col)
                result[col] = pd.to_datetime(result[col], format=fmt, errors="coerce")
            elif target_type == "int":
                result[col] = pd.to_numeric(result[col], errors="coerce").astype("Int64")
            elif target_type == "float":
                result[col] = pd.to_numeric(result[col], errors="coerce").astype(float)
            elif target_type == "str":
                result[col] = result[col].astype(str)
            elif target_type == "bool":
                result[col] = result[col].astype(bool)
            else:
                raise TransformError(
                    f"cast: unsupported type '{target_type}' for column '{col}'. "
                    f"Supported types: int, float, str, bool, date, datetime."
                )
        except TransformError:
            raise
        except Exception as exc:
            sample = result[col].dropna().head(3).tolist()
            raise TransformError(
                f"cast: failed to cast column '{col}' to '{target_type}'. "
                f"Sample values: {sample}. Error: {exc}"
            ) from exc
    return result


def _apply_filter(df: pd.DataFrame, step: Dict[str, Any]) -> pd.DataFrame:
    expression: str = step.get("expression", "")
    if not expression:
        raise TransformError("filter: 'expression' is required.")
    try:
        return df.query(expression).reset_index(drop=True)
    except Exception as exc:
        raise TransformError(
            f"filter: invalid expression '{expression}': {exc}"
        ) from exc


def _apply_derive(df: pd.DataFrame, step: Dict[str, Any]) -> pd.DataFrame:
    columns: Dict[str, str] = step.get("columns") or {}
    result = df.copy()
    for new_col, expression in columns.items():
        try:
            result[new_col] = result.eval(expression)
        except Exception as exc:
            raise TransformError(
                f"derive: failed to compute column '{new_col}' "
                f"from expression '{expression}': {exc}"
            ) from exc
    return result


def _apply_aggregate(df: pd.DataFrame, step: Dict[str, Any]) -> pd.DataFrame:
    group_by: List[str] = step.get("group_by") or []
    aggregations: Dict[str, str] = step.get("aggregations") or {}

    if not aggregations:
        raise TransformError("aggregate: 'aggregations' mapping is required.")

    # Validate columns exist
    for col in aggregations:
        if col not in df.columns:
            raise TransformError(
                f"aggregate: column '{col}' not found in DataFrame. "
                f"Available columns: {list(df.columns)}"
            )

    # Validate agg functions
    for col, func in aggregations.items():
        if func not in _SUPPORTED_AGGS:
            raise TransformError(
                f"aggregate: unsupported aggregation function '{func}' for column '{col}'. "
                f"Supported: {_SUPPORTED_AGGS}"
            )

    try:
        if group_by:
            return df.groupby(group_by, as_index=False).agg(aggregations).reset_index(drop=True)
        else:
            row = {col: getattr(df[col], func)() for col, func in aggregations.items()}
            return pd.DataFrame([row])
    except TransformError:
        raise
    except Exception as exc:
        raise TransformError(f"aggregate: aggregation failed: {exc}") from exc


def _apply_python(df: pd.DataFrame, step: Dict[str, Any]) -> pd.DataFrame:
    function_path: Optional[str] = step.get("function")
    inline_code: Optional[str] = step.get("inline")

    if function_path:
        # Dotted import path: my_package.transforms.normalize
        parts = function_path.rsplit(".", 1)
        if len(parts) != 2:
            raise TransformError(
                f"python: 'function' must be a dotted import path like 'my_module.my_function'. "
                f"Got: '{function_path}'"
            )
        module_path, func_name = parts
        try:
            module = importlib.import_module(module_path)
        except ModuleNotFoundError as exc:
            raise TransformError(
                f"python: cannot import module '{module_path}': {exc}"
            ) from exc

        func = getattr(module, func_name, None)
        if func is None:
            raise TransformError(
                f"python: function '{func_name}' not found in module '{module_path}'."
            )

        try:
            result = func(df)
        except Exception as exc:
            raise TransformError(
                f"python: function '{function_path}' raised an error: {exc}"
            ) from exc

        if not isinstance(result, pd.DataFrame):
            raise TransformError(
                f"python: function '{function_path}' must return a pd.DataFrame, "
                f"got {type(result).__name__}."
            )
        return result

    elif inline_code:
        local_ns: Dict[str, Any] = {"df": df.copy(), "pd": pd}
        try:
            exec(inline_code, local_ns)  # noqa: S102
        except Exception as exc:
            raise TransformError(
                f"python: inline code raised an error: {exc}"
            ) from exc

        result = local_ns.get("df")
        if not isinstance(result, pd.DataFrame):
            raise TransformError(
                "python: inline code must reassign 'df' to a pd.DataFrame."
            )
        return result

    else:
        raise TransformError("python: either 'function' or 'inline' is required.")


# ─────────────────────────────────────────────────────────────────────────────
# Main engine
# ─────────────────────────────────────────────────────────────────────────────

_STEP_HANDLERS = {
    "rename":    _apply_rename,
    "cast":      _apply_cast,
    "filter":    _apply_filter,
    "derive":    _apply_derive,
    "aggregate": _apply_aggregate,
    "python":    _apply_python,
}


class TransformEngine:
    """
    Executes a sequence of transform steps defined in datasets.yaml.

    Usage
    -----
        engine = TransformEngine(dataset_config)
        transformed_df = engine.run(df)
    """

    def __init__(self, dataset_config: Dict[str, Any]) -> None:
        self.steps: List[Dict[str, Any]] = (dataset_config or {}).get("transforms") or []

    @property
    def has_transforms(self) -> bool:
        return len(self.steps) > 0

    def run(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply all transform steps in order and return the resulting DataFrame.

        Raises TransformError if any step fails.
        """
        if not self.steps:
            return df

        result = df
        for i, step in enumerate(self.steps):
            step_type = str(step.get("type", "")).lower()

            if not step_type:
                raise TransformError(
                    f"Transform step {i} is missing the required 'type' key."
                )

            if step_type not in _STEP_HANDLERS:
                raise TransformError(
                    f"Transform step {i}: unknown type '{step_type}'. "
                    f"Supported types: {_SUPPORTED_TYPES}"
                )

            handler = _STEP_HANDLERS[step_type]
            try:
                result = handler(result, step)
            except TransformError:
                raise
            except Exception as exc:
                raise TransformError(
                    f"Transform step {i} (type='{step_type}') failed: {exc}"
                ) from exc

        return result
