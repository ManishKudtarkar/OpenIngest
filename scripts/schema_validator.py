from scripts.discover_datasets import discover_datasets
from utils.schema_utils import compare_schema


def validate_schema():

    datasets = discover_datasets()

    print("=" * 80)
    print("OPENINGEST SCHEMA VALIDATION")
    print("=" * 80)

    for ds in datasets:

        print(f"\nDataset : {ds.name}")

        if not ds.registered:
            print("Status : NEW DATASET")
            print("Action : Register this dataset in configs/datasets.yaml")
            continue

        required = ds.config["required_columns"]

        result = compare_schema(
            ds.columns,
            required
        )

        if result["valid"]:
            ds.schema_valid = True
            print("Status : VALID")
        else:
            ds.schema_valid = False
            print("Status : INVALID")

            if result["missing"]:
                print("\nMissing Columns:")
                for column in result["missing"]:
                    print(f"  - {column}")

        if result["extra"]:
            print("\nExtra Columns:")
            for column in result["extra"]:
                print(f"  + {column}")


if __name__ == "__main__":
    validate_schema()