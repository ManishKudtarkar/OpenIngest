import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from core.discovery import discover_datasets
from core.quality import run_quality_checks


def run_data_quality_checks():
    """
    Execute data quality checks for every registered dataset.
    """

    print("=" * 80)
    print("OPENINGEST DATA QUALITY ENGINE")
    print("=" * 80)

    datasets = discover_datasets()

    total = 0
    passed = 0
    failed = 0

    for dataset in datasets:

        if not dataset.registered:
            continue

        total += 1

        result = run_quality_checks(dataset)

        print(
            f"{dataset.name:<15}"
            f"{result['status']:<10}"
            f"{result['score']:>7.2f}%"
            f"   Checks: {result['checks_passed']}/{result['checks_total']}"
        )

        if result["passed"]:
            passed += 1
        else:
            failed += 1

    print("\n" + "=" * 80)
    print("QUALITY SUMMARY")
    print("=" * 80)

    print(f"Datasets Checked : {total}")
    print(f"Passed           : {passed}")
    print(f"Failed           : {failed}")

    print("=" * 80)

    if failed:
        raise ValueError(
            f"Data quality failed for {failed} dataset(s)."
        )

    print("✓ All data quality checks passed successfully.")


if __name__ == "__main__":
    run_data_quality_checks()