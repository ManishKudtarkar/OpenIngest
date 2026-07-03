import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from core.observability import (
    get_dashboard_kpis,
    get_dataset_current_vs_previous,
    get_dataset_health_trends,
    get_incremental_summary,
    get_latest_dataset_health,
    get_quality_distribution,
    get_recent_pipeline_runs,
    get_slowest_datasets,
)


def _format_delta(current, previous, inverse_good: bool = False) -> str:
    if previous is None or current is None:
        return "-> n/a"

    try:
        current = float(current)
        previous = float(previous)
    except (TypeError, ValueError):
        return "-> n/a"

    if previous == 0:
        if current == 0:
            return "-> 0.00%"

        return "+ inf"

    change_pct = ((current - previous) / previous) * 100

    if abs(change_pct) < 0.01:
        return "-> 0.00%"

    improved = change_pct < 0 if inverse_good else change_pct > 0
    if improved:
        arrow = "up"
    else:
        arrow = "down"

    if inverse_good:
        arrow = "down" if improved else "up"

    return f"{arrow} {change_pct:+.2f}%"


def _bar(label: str, value: int, scale: int = 1) -> str:
    units = max(int(value / max(scale, 1)), 0)
    return f"{label:<5} {'#' * units} {value}"


def show_dashboard():
    print()
    print("=" * 80)
    print("OPENINGEST MONITORING DASHBOARD")
    print("=" * 80)

    kpis = get_dashboard_kpis()
    recent_runs = get_recent_pipeline_runs(limit=5)
    latest_health = get_latest_dataset_health()
    trends = get_dataset_health_trends(limit_runs=20)
    deltas = get_dataset_current_vs_previous()
    slowest = get_slowest_datasets(limit=3)
    incremental = get_incremental_summary()
    quality_distribution = get_quality_distribution()

    print("\nPIPELINE KPIS")
    print("-" * 80)
    print(f"Datasets          : {kpis['datasets']}")
    print(f"Pipeline Success  : {kpis['pipeline_success_pct']:.2f}%")
    print(f"Rows Processed    : {kpis['rows_processed']:,}")
    print(f"Quality Score     : {kpis['quality_score']:.2f}%")
    print(f"Average Duration  : {kpis['average_duration_seconds']:.2f} sec")

    print("\nRECENT PIPELINE RUNS")
    print("-" * 80)
    if recent_runs.empty:
        print("No pipeline runs found.")
    else:
        print(recent_runs.to_string(index=False))

    print("\nLATEST DATASET HEALTH")
    print("-" * 80)
    if latest_health.empty:
        print("No dataset run history found.")
    else:
        print(latest_health.to_string(index=False))

    print("\nDATASET TRENDS (LAST 20 RUNS)")
    print("-" * 80)
    if trends.empty:
        print("No trend data found.")
    else:
        print(trends.to_string(index=False))

    print("\nTREND ARROWS (LATEST VS PREVIOUS RUN)")
    print("-" * 80)
    if deltas.empty:
        print("No comparison data found.")
    else:
        for _, row in deltas.iterrows():
            rows_delta = _format_delta(row.current_rows_loaded, row.previous_rows_loaded)
            duration_delta = _format_delta(
                row.current_duration_seconds,
                row.previous_duration_seconds,
                inverse_good=True,
            )
            quality_delta = _format_delta(row.current_quality_score, row.previous_quality_score)

            print(
                f"{row.dataset_name:<15}"
                f"Rows {rows_delta:<14}"
                f"Duration {duration_delta:<16}"
                f"Quality {quality_delta}"
            )

    print("\nTOP SLOWEST DATASETS")
    print("-" * 80)
    if slowest.empty:
        print("No dataset timing data found.")
    else:
        for _, row in slowest.iterrows():
            print(f"{row.dataset_name:<15} {row.duration_seconds:>8.2f} sec")

    print("\nINCREMENTAL SUMMARY")
    print("-" * 80)
    print(f"Incremental Datasets : {incremental['incremental_datasets']}")
    print(f"New Records          : {incremental['new_records']:,}")
    print(f"Skipped Records      : {incremental['skipped_records']:,}")
    print(f"Latest Watermark     : {incremental['latest_watermark']}")

    print("\nQUALITY")
    print("-" * 80)
    print(_bar("PASS", quality_distribution.get("PASS", 0), scale=1))
    print(_bar("FAIL", quality_distribution.get("FAIL", 0), scale=1))

    print("=" * 80)


if __name__ == "__main__":
    show_dashboard()
