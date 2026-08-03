"""Tests for core.validation — compare_schema and validate_dataset."""

from __future__ import annotations

from types import SimpleNamespace

from core.validation import compare_schema, validate_dataset

# ── compare_schema ────────────────────────────────────────────────────────────

def test_compare_schema_all_present() -> None:
    result = compare_schema(["a", "b", "c"], ["a", "b"])
    assert result["valid"] is True
    assert result["missing"] == []
    assert result["extra"] == ["c"]


def test_compare_schema_missing_columns() -> None:
    result = compare_schema(["a"], ["a", "b", "c"])
    assert result["valid"] is False
    assert result["missing"] == ["b", "c"]


def test_compare_schema_exact_match() -> None:
    result = compare_schema(["x", "y"], ["x", "y"])
    assert result["valid"] is True
    assert result["missing"] == []
    assert result["extra"] == []


def test_compare_schema_empty_required() -> None:
    result = compare_schema(["a", "b", "c"], [])
    assert result["valid"] is True
    assert result["missing"] == []
    assert sorted(result["extra"]) == ["a", "b", "c"]


def test_compare_schema_empty_discovered() -> None:
    result = compare_schema([], ["a", "b"])
    assert result["valid"] is False
    assert result["missing"] == ["a", "b"]


def test_compare_schema_missing_sorted() -> None:
    result = compare_schema([], ["z", "a", "m"])
    assert result["missing"] == ["a", "m", "z"]


# ── validate_dataset ──────────────────────────────────────────────────────────

def _make_dataset(columns: list, required: list) -> SimpleNamespace:
    return SimpleNamespace(
        name="test_ds",
        columns=columns,
        schema_valid=None,
        config={"required_columns": required},
    )


def test_validate_dataset_passes_when_all_present() -> None:
    ds = _make_dataset(["id", "name", "email"], ["id", "email"])
    result = validate_dataset(ds)
    assert result["valid"] is True
    assert ds.schema_valid is True


def test_validate_dataset_fails_when_missing() -> None:
    ds = _make_dataset(["id"], ["id", "amount", "created_at"])
    result = validate_dataset(ds)
    assert result["valid"] is False
    assert "amount" in result["missing"]
    assert "created_at" in result["missing"]
    assert ds.schema_valid is False


def test_validate_dataset_no_required_columns() -> None:
    ds = _make_dataset(["col1", "col2"], [])
    result = validate_dataset(ds)
    assert result["valid"] is True


def test_validate_dataset_no_config() -> None:
    ds = SimpleNamespace(name="ds", columns=["a", "b"], schema_valid=None, config=None)
    result = validate_dataset(ds)
    assert result["valid"] is True
