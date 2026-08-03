from typing import Any

from models.dataset import Dataset


def compare_schema(
    discovered_columns: list[str],
    required_columns: list[str],
) -> dict[str, Any]:

    discovered = set(discovered_columns)
    required = set(required_columns)

    missing = sorted(required - discovered)
    extra = sorted(discovered - required)

    return {
        "valid": len(missing) == 0,
        "missing": missing,
        "extra": extra,
    }


def validate_dataset(dataset: Dataset) -> dict[str, Any]:

    config = dataset.config or {}
    required: list[str] = config.get("required_columns", [])

    result = compare_schema(
        dataset.columns,
        required,
    )

    dataset.schema_valid = result["valid"]

    return result