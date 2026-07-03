from types import SimpleNamespace

from core.quality_report import build_quality_report


def test_build_quality_report_all_pass() -> None:
    dataset = SimpleNamespace(
        name="customers",
        quality_checked=False,
        quality_score=0.0,
        quality_status="NOT_RUN",
        quality_summary=None,
    )

    checks = [
        {"name": "non_null:id", "passed": True, "failed_rows": 0, "details": {}},
        {"name": "unique:id", "passed": True, "failed_rows": 0, "details": {}},
    ]

    result = build_quality_report(dataset, df_rows=100, checks=checks)

    assert result["status"] == "PASS"
    assert result["score"] == 100.0
    assert dataset.quality_checked is True
    assert dataset.quality_status == "PASS"


def test_build_quality_report_partial_fail() -> None:
    dataset = SimpleNamespace(
        name="orders",
        quality_checked=False,
        quality_score=0.0,
        quality_status="NOT_RUN",
        quality_summary=None,
    )

    checks = [
        {"name": "non_null:order_id", "passed": True, "failed_rows": 0, "details": {}},
        {"name": "range:total_usd", "passed": False, "failed_rows": 3, "details": {}},
    ]

    result = build_quality_report(dataset, df_rows=50, checks=checks)

    assert result["status"] == "FAIL"
    assert result["checks_failed"] == 1
    assert result["score"] == 50.0
