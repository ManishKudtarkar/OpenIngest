from core.quality_rules import evaluate_quality_rules


class DummyDataset:
    def __init__(self) -> None:
        self.name = "orders"
        self.config = {
            "required_columns": ["order_id", "subtotal_usd", "total_usd"],
            "primary_key": ["order_id"],
            "unique_columns": ["order_id"],
            "non_null_columns": ["order_id"],
        }


def test_evaluate_quality_rules_returns_checks() -> None:
    import pandas as pd

    dataset = DummyDataset()
    df = pd.DataFrame(
        {
            "order_id": [1, 2],
            "subtotal_usd": [100.0, 200.0],
            "total_usd": [90.0, 180.0],
            "order_time": ["2025-01-01T10:00:00", "2025-01-02T10:00:00"],
            "customer_id": [11, 12],
        }
    )

    checks = evaluate_quality_rules(dataset, df)

    assert isinstance(checks, list)
    assert len(checks) > 0
    assert all("name" in check for check in checks)
