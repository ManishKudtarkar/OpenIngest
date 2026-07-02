from typing import List


def compare_schema(discovered_columns: List[str], required_columns: List[str]):
    discovered = set(discovered_columns)
    required = set(required_columns)

    missing = sorted(required - discovered)
    extra = sorted(discovered - required)

    return {
        "valid": len(missing) == 0,
        "missing": missing,
        "extra": extra,
    }