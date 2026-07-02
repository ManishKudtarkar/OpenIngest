def compare_schema(discovered_columns, required_columns):

    discovered = set(discovered_columns)
    required = set(required_columns)

    missing = sorted(required - discovered)
    extra = sorted(discovered - required)

    return {
        "valid": len(missing) == 0,
        "missing": missing,
        "extra": extra,
    }


def validate_dataset(dataset):

    required = dataset.config["required_columns"]

    result = compare_schema(
        dataset.columns,
        required
    )

    dataset.schema_valid = result["valid"]

    return result