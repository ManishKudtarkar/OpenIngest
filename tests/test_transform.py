"""Tests for core.transform — TransformEngine and all step types."""

from __future__ import annotations

import pandas as pd
import pytest

from core.transform import TransformEngine, TransformError

# ── helpers ──────────────────────────────────────────────────────────────────

def _engine(steps: list) -> TransformEngine:
    return TransformEngine({"transforms": steps})


def _base_df() -> pd.DataFrame:
    return pd.DataFrame({
        "order_id": [1, 2, 3],
        "amount":   [10.5, 0.0, -5.0],
        "qty":      [2, 4, 1],
        "status":   ["active", "inactive", "active"],
    })


# ── no transforms ─────────────────────────────────────────────────────────────

def test_no_transforms_returns_df_unchanged() -> None:
    df = _base_df()
    result = TransformEngine({}).run(df)
    assert result.equals(df)


def test_empty_transforms_list() -> None:
    df = _base_df()
    result = TransformEngine({"transforms": []}).run(df)
    assert result.equals(df)


def test_has_transforms_false_when_empty() -> None:
    assert TransformEngine({}).has_transforms is False


def test_has_transforms_true_when_steps_present() -> None:
    engine = _engine([{"type": "filter", "expression": "amount > 0"}])
    assert engine.has_transforms is True


# ── rename ───────────────────────────────────────────────────────────────────

def test_rename_basic() -> None:
    df = _base_df()
    result = _engine([{"type": "rename", "columns": {"order_id": "id", "amount": "price"}}]).run(df)
    assert "id" in result.columns
    assert "price" in result.columns
    assert "order_id" not in result.columns
    assert "amount" not in result.columns


def test_rename_missing_column_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="nonexistent"):
        _engine([{"type": "rename", "columns": {"nonexistent": "x"}}]).run(df)


def test_rename_preserves_other_columns() -> None:
    df = _base_df()
    result = _engine([{"type": "rename", "columns": {"order_id": "id"}}]).run(df)
    assert "amount" in result.columns
    assert "qty" in result.columns


# ── cast ─────────────────────────────────────────────────────────────────────

def test_cast_to_float() -> None:
    df = pd.DataFrame({"val": ["1.1", "2.2", "3.3"]})
    result = _engine([{"type": "cast", "columns": {"val": "float"}}]).run(df)
    assert result["val"].dtype == float


def test_cast_to_str() -> None:
    df = pd.DataFrame({"n": [1, 2, 3]})
    result = _engine([{"type": "cast", "columns": {"n": "str"}}]).run(df)
    # pandas 2.x returns StringDtype for astype(str), both are string-like
    assert pd.api.types.is_string_dtype(result["n"])


def test_cast_to_int() -> None:
    df = pd.DataFrame({"val": ["1", "2", "3"]})  # string ints — safe to cast
    result = _engine([{"type": "cast", "columns": {"val": "int"}}]).run(df)
    assert str(result["val"].dtype) == "Int64"


def test_cast_to_datetime() -> None:
    df = pd.DataFrame({"ts": ["2024-01-01", "2024-06-15"]})
    result = _engine([{"type": "cast", "columns": {"ts": "datetime"}}]).run(df)
    assert pd.api.types.is_datetime64_any_dtype(result["ts"])


def test_cast_unsupported_type_raises() -> None:
    df = pd.DataFrame({"x": [1, 2]})
    with pytest.raises(TransformError, match="unsupported type"):
        _engine([{"type": "cast", "columns": {"x": "uuid"}}]).run(df)


def test_cast_missing_column_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="not found"):
        _engine([{"type": "cast", "columns": {"no_such_col": "float"}}]).run(df)


# ── filter ───────────────────────────────────────────────────────────────────

def test_filter_keeps_matching_rows() -> None:
    df = _base_df()
    result = _engine([{"type": "filter", "expression": "amount > 0"}]).run(df)
    assert len(result) == 1
    assert result.iloc[0]["order_id"] == 1


def test_filter_empty_result_ok() -> None:
    df = _base_df()
    result = _engine([{"type": "filter", "expression": "amount > 1000"}]).run(df)
    assert len(result) == 0
    assert isinstance(result, pd.DataFrame)


def test_filter_invalid_expression_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="invalid expression"):
        _engine([{"type": "filter", "expression": "$$invalid$$"}]).run(df)


def test_filter_missing_expression_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="'expression' is required"):
        _engine([{"type": "filter"}]).run(df)


# ── derive ───────────────────────────────────────────────────────────────────

def test_derive_new_column() -> None:
    df = _base_df()
    result = _engine([{"type": "derive", "columns": {"revenue": "amount * qty"}}]).run(df)
    assert "revenue" in result.columns
    assert result["revenue"].tolist() == [21.0, 0.0, -5.0]


def test_derive_overwrites_existing_column() -> None:
    df = pd.DataFrame({"x": [1, 2], "y": [3, 4]})
    result = _engine([{"type": "derive", "columns": {"x": "y * 2"}}]).run(df)
    assert result["x"].tolist() == [6, 8]


def test_derive_invalid_expression_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="derive"):
        _engine([{"type": "derive", "columns": {"bad": "$$$$"}}]).run(df)


# ── aggregate ────────────────────────────────────────────────────────────────

def test_aggregate_group_by() -> None:
    df = pd.DataFrame({
        "region": ["A", "A", "B"],
        "sales":  [10, 20, 30],
    })
    result = _engine([{
        "type": "aggregate",
        "group_by": ["region"],
        "aggregations": {"sales": "sum"},
    }]).run(df)
    assert set(result["region"]) == {"A", "B"}
    a_row = result[result["region"] == "A"].iloc[0]
    assert a_row["sales"] == 30


def test_aggregate_no_group_by() -> None:
    df = pd.DataFrame({"val": [1, 2, 3, 4]})
    result = _engine([{
        "type": "aggregate",
        "group_by": [],
        "aggregations": {"val": "sum"},
    }]).run(df)
    assert len(result) == 1
    assert result.iloc[0]["val"] == 10


def test_aggregate_missing_column_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="not found"):
        _engine([{
            "type": "aggregate",
            "group_by": [],
            "aggregations": {"no_such": "sum"},
        }]).run(df)


def test_aggregate_unsupported_function_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="unsupported aggregation"):
        _engine([{
            "type": "aggregate",
            "group_by": [],
            "aggregations": {"amount": "stddev"},
        }]).run(df)


def test_aggregate_missing_aggregations_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="'aggregations' mapping is required"):
        _engine([{"type": "aggregate", "group_by": []}]).run(df)


# ── python ───────────────────────────────────────────────────────────────────

def test_python_inline() -> None:
    df = pd.DataFrame({"x": [1, 2, 3]})
    result = _engine([{
        "type": "python",
        "inline": "df = df[df['x'] > 1]",
    }]).run(df)
    assert len(result) == 2


def test_python_inline_must_return_dataframe() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="must reassign 'df'"):
        _engine([{"type": "python", "inline": "df = 42"}]).run(df)


def test_python_inline_error_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="inline code raised"):
        _engine([{"type": "python", "inline": "raise ValueError('boom')"}]).run(df)


def test_python_bad_import_path_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="cannot import module"):
        _engine([{"type": "python", "function": "no_such_module.no_func"}]).run(df)


def test_python_invalid_dotted_path_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="dotted import path"):
        _engine([{"type": "python", "function": "no_dot"}]).run(df)


def test_python_neither_function_nor_inline_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="either 'function' or 'inline'"):
        _engine([{"type": "python"}]).run(df)


# ── unknown step type ────────────────────────────────────────────────────────

def test_unknown_step_type_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="unknown type"):
        _engine([{"type": "explode_everything"}]).run(df)


def test_missing_step_type_raises() -> None:
    df = _base_df()
    with pytest.raises(TransformError, match="missing the required 'type' key"):
        _engine([{"columns": {"x": "y"}}]).run(df)


# ── chained steps ────────────────────────────────────────────────────────────

def test_chained_steps() -> None:
    df = _base_df()
    result = _engine([
        {"type": "filter",  "expression": "amount > 0"},
        {"type": "rename",  "columns": {"order_id": "id"}},
        {"type": "derive",  "columns": {"total": "amount * qty"}},
        {"type": "cast",    "columns": {"total": "float"}},
    ]).run(df)

    assert "id" in result.columns
    assert "total" in result.columns
    assert len(result) == 1
    assert result.iloc[0]["total"] == 21.0
