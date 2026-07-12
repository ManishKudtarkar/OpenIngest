from __future__ import annotations

import json
from typing import Any, Dict, List

from models.dataset import Dataset


def build_quality_report(dataset: Dataset, df_rows: int, checks: List[Dict[str, Any]]) -> Dict[str, Any]:
    passed_checks = sum(1 for check in checks if check["passed"])
    failed_checks = len(checks) - passed_checks
    score = round((passed_checks / len(checks)) * 100, 2) if checks else 100.0
    passed = failed_checks == 0

    result = {
        "dataset_name": dataset.name,
        "rows_checked": int(df_rows),
        "checks_total": int(len(checks)),
        "checks_passed": int(passed_checks),
        "checks_failed": int(failed_checks),
        "score": score,
        "status": "PASS" if passed else "FAIL",
        "passed": passed,
        "checks": checks,
    }

    dataset.quality_checked = True
    dataset.quality_score = score
    dataset.quality_status = "PASS" if passed else "FAIL"
    dataset.quality_summary = json.dumps(result, default=str)

    return result