import pandas as pd

from core.quality_report import build_quality_report
from core.quality_rules import evaluate_quality_rules
from typing import Optional, Dict, Any


def run_quality_checks(dataset, df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    if df is None:
        df = pd.read_csv(dataset.file)

    checks = evaluate_quality_rules(dataset, df)

    return build_quality_report(dataset, len(df), checks)