from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
import yaml


QUALITY_RULES_FILE = Path(__file__).resolve().parents[1] / "configs" / "validation_rules.yaml"


def load_quality_rules() -> Dict[str, Any]:
    if not QUALITY_RULES_FILE.exists():
        return {}

    with open(QUALITY_RULES_FILE, "r", encoding="utf-8") as handle:
        return yaml.safe_load(handle) or {}


def get_dataset_rules(dataset_name: str) -> Dict[str, Any]:
    config = load_quality_rules()
    return (config.get("datasets") or {}).get(dataset_name, {})


def _clean_series(series: pd.Series) -> pd.Series:
    cleaned = series.dropna()

    if cleaned.empty:
        return cleaned

    if cleaned.dtype == object or pd.api.types.is_string_dtype(cleaned):
        cleaned = cleaned.astype(str).str.strip()
        cleaned = cleaned[cleaned != ""]

    return cleaned


def _is_type(series: pd.Series, expected_type: str) -> bool:
    cleaned = _clean_series(series)

    if cleaned.empty:
        return True

    expected = expected_type.strip().lower()

    if expected in {"string", "text"}:
        return True

    if expected in {"integer", "int", "bigint", "smallint"}:
        numeric = pd.to_numeric(cleaned, errors="coerce")
        return numeric.notna().all() and bool((numeric % 1 == 0).all())

    if expected in {"number", "numeric", "decimal", "float", "double", "double precision"}:
        numeric = pd.to_numeric(cleaned, errors="coerce")
        return numeric.notna().all()

    if expected in {"boolean", "bool"}:
        normalized = cleaned.astype(str).str.lower().str.strip()
        return normalized.isin({"true", "false", "t", "f", "yes", "no", "1", "0"}).all()

    if expected in {"datetime", "timestamp", "date"}:
        parsed = pd.to_datetime(cleaned, errors="coerce")
        return parsed.notna().all()

    return True


def _count_duplicates(df: pd.DataFrame, columns: List[str]) -> int:
    if not columns:
        return 0

    return int(df.duplicated(subset=columns).sum())


def _count_nulls(df: pd.DataFrame, columns: List[str]) -> Dict[str, int]:
    counts: Dict[str, int] = {}

    for column in columns:
        if column not in df.columns:
            counts[column] = len(df)
            continue

        counts[column] = int(df[column].isna().sum())

    return counts


def _count_type_mismatches(df: pd.DataFrame, type_rules: Dict[str, str]) -> Dict[str, int]:
    counts: Dict[str, int] = {}

    for column, expected_type in type_rules.items():
        if column not in df.columns:
            counts[column] = len(df)
            continue

        counts[column] = 0 if _is_type(df[column], expected_type) else int(df[column].dropna().shape[0])

    return counts


def _count_range_violations(df: pd.DataFrame, range_rules: Dict[str, Dict[str, Any]]) -> Dict[str, int]:
    counts: Dict[str, int] = {}

    for column, rule in range_rules.items():
        if column not in df.columns:
            counts[column] = len(df)
            continue

        numeric = pd.to_numeric(df[column], errors="coerce")
        violations = pd.Series(False, index=df.index)

        minimum = rule.get("min")
        maximum = rule.get("max")

        if minimum is not None:
            violations = violations | (numeric < minimum)

        if maximum is not None:
            violations = violations | (numeric > maximum)

        counts[column] = int(violations.fillna(True).sum())

    return counts


def _count_regex_violations(df: pd.DataFrame, regex_rules: Dict[str, str]) -> Dict[str, int]:
    counts: Dict[str, int] = {}

    for column, pattern in regex_rules.items():
        if column not in df.columns:
            counts[column] = len(df)
            continue

        series = df[column].dropna().astype(str)
        if series.empty:
            counts[column] = 0
            continue

        counts[column] = int((~series.str.match(pattern, na=False)).sum())

    return counts


def _count_custom_rule_violations(df: pd.DataFrame, custom_rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []

    for rule in custom_rules:
        name = rule.get("name", "custom_rule")
        condition = rule.get("condition")

        if not condition:
            results.append(
                {
                    "name": name,
                    "passed": False,
                    "failed_rows": len(df),
                    "message": "Missing condition",
                }
            )
            continue

        try:
            mask = df.eval(condition, engine="python")

            if not isinstance(mask, pd.Series) or mask.dtype != bool:
                raise ValueError("Condition must evaluate to a boolean series.")

            failed_rows = int((~mask.fillna(False)).sum())

            results.append(
                {
                    "name": name,
                    "passed": failed_rows == 0,
                    "failed_rows": failed_rows,
                    "message": rule.get("message", condition),
                }
            )
        except Exception as exc:
            results.append(
                {
                    "name": name,
                    "passed": False,
                    "failed_rows": len(df),
                    "message": f"{condition} ({exc})",
                }
            )

    return results


def _add_check(checks: List[Dict[str, Any]], name: str, passed: bool, failed_rows: int = 0, details: Dict[str, Any] | None = None) -> None:
    checks.append(
        {
            "name": name,
            "passed": passed,
            "failed_rows": int(failed_rows),
            "details": details or {},
        }
    )


def evaluate_quality_rules(dataset, df: pd.DataFrame) -> List[Dict[str, Any]]:
    rules = get_dataset_rules(dataset.name)
    dataset_config = dataset.config or {}

    checks: List[Dict[str, Any]] = []

    required_columns = list(dict.fromkeys(dataset_config.get("required_columns", [])))
    missing_required = [column for column in required_columns if column not in df.columns]
    _add_check(
        checks,
        "required_columns_present",
        not missing_required,
        len(missing_required),
        {"missing": missing_required},
    )

    non_null_columns = list(dict.fromkeys(dataset_config.get("non_null_columns", [])))
    null_counts = _count_nulls(df, non_null_columns)
    for column, count in null_counts.items():
        _add_check(
            checks,
            f"non_null:{column}",
            count == 0,
            count,
            {"column": column},
        )

    primary_key = list(dict.fromkeys(dataset_config.get("primary_key", [])))
    if primary_key:
        primary_key_nulls = _count_nulls(df, primary_key)
        for column, count in primary_key_nulls.items():
            _add_check(
                checks,
                f"primary_key_not_null:{column}",
                count == 0,
                count,
                {"column": column},
            )

        duplicate_primary_key = _count_duplicates(df, primary_key)
        _add_check(
            checks,
            f"primary_key_unique:{','.join(primary_key)}",
            duplicate_primary_key == 0,
            duplicate_primary_key,
            {"columns": primary_key},
        )

    unique_columns = list(dict.fromkeys(dataset_config.get("unique_columns", [])))
    for column in unique_columns:
        duplicate_count = _count_duplicates(df, [column])
        _add_check(
            checks,
            f"unique:{column}",
            duplicate_count == 0,
            duplicate_count,
            {"column": column},
        )

    type_rules = rules.get("type_checks", {})
    type_mismatches = _count_type_mismatches(df, type_rules)
    for column, count in type_mismatches.items():
        _add_check(
            checks,
            f"type:{column}",
            count == 0,
            count,
            {"column": column, "expected_type": type_rules.get(column)},
        )

    range_rules = rules.get("range_checks", {})
    range_violations = _count_range_violations(df, range_rules)
    for column, count in range_violations.items():
        _add_check(
            checks,
            f"range:{column}",
            count == 0,
            count,
            {"column": column, "rule": range_rules.get(column, {})},
        )

    regex_rules = rules.get("regex_checks", {})
    regex_violations = _count_regex_violations(df, regex_rules)
    for column, count in regex_violations.items():
        _add_check(
            checks,
            f"regex:{column}",
            count == 0,
            count,
            {"column": column, "pattern": regex_rules.get(column)},
        )

    custom_rules = rules.get("custom_rules", [])
    checks.extend(_count_custom_rule_violations(df, custom_rules))

    return checks