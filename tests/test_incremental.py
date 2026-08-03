"""Tests for incremental loading helpers — watermark filter, row hash, state."""

from __future__ import annotations

import pandas as pd
import pytest

from core.incremental import (
    _filter_by_watermark,
    _normalize_datetime_series,
    _row_hash,
)


# ── _normalize_datetime_series ────────────────────────────────────────────────

def test_normalize_datetime_parses_iso() -> None:
    s = pd.Series(["2024-01-01", "2024-06-15"])
    result = _normalize_datetime_series(s)
    assert pd.api.types.is_datetime64_any_dtype(result)
    assert result.notna().all()


def test_normalize_datetime_coerces_bad_values() -> None:
    s = pd.Series(["not-a-date", "2024-01-01"])
    result = _normalize_datetime_series(s)
    assert pd.isna(result.iloc[0])
    assert pd.notna(result.iloc[1])


# ── _row_hash ─────────────────────────────────────────────────────────────────

def test_row_hash_same_data_same_hash() -> None:
    df = pd.DataFrame({"a": [1, 2], "b": ["x", "y"]})
    h1 = _row_hash(df, ["a", "b"])
    h2 = _row_hash(df.copy(), ["a", "b"])
    assert h1.tolist() == h2.tolist()


def test_row_hash_different_data_different_hash() -> None:
    df1 = pd.DataFrame({"a": [1], "b": ["x"]})
    df2 = pd.DataFrame({"a": [2], "b": ["y"]})
    h1 = _row_hash(df1, ["a", "b"])
    h2 = _row_hash(df2, ["a", "b"])
    assert h1.tolist() != h2.tolist()


def test_row_hash_uses_all_columns_when_empty_list() -> None:
    df = pd.DataFrame({"a": [1], "b": [2], "c": [3]})
    # Should not raise
    result = _row_hash(df, [])
    assert len(result) == 1
    assert len(result.iloc[0]) == 64  # SHA-256 hex digest length


def test_row_hash_returns_series() -> None:
    df = pd.DataFrame({"x": [1, 2, 3]})
    result = _row_hash(df, ["x"])
    assert isinstance(result, pd.Series)
    assert len(result) == 3


# ── _filter_by_watermark ──────────────────────────────────────────────────────

def test_filter_by_watermark_no_prior_watermark() -> None:
    df = pd.DataFrame({
        "ts": ["2024-01-01", "2024-06-01", "2024-12-01"],
        "val": [1, 2, 3],
    })
    result = _filter_by_watermark(df, "ts", None)
    assert len(result) == 3


def test_filter_by_watermark_filters_old_rows() -> None:
    df = pd.DataFrame({
        "ts": ["2024-01-01", "2024-06-01", "2024-12-01"],
        "val": [1, 2, 3],
    })
    result = _filter_by_watermark(df, "ts", "2024-06-01")
    assert len(result) == 1
    assert result.iloc[0]["val"] == 3


def test_filter_by_watermark_missing_column_returns_all() -> None:
    df = pd.DataFrame({"val": [1, 2, 3]})
    result = _filter_by_watermark(df, "nonexistent_ts", "2024-01-01")
    assert len(result) == 3


def test_filter_by_watermark_invalid_watermark_returns_all() -> None:
    df = pd.DataFrame({
        "ts": ["2024-01-01", "2024-06-01"],
        "val": [1, 2],
    })
    result = _filter_by_watermark(df, "ts", "not-a-date")
    assert len(result) == 2
