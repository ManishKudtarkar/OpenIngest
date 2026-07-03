import pandas as pd
import streamlit as st

from core.observability import (
    get_dashboard_kpis,
    get_dataset_health_trends,
    get_incremental_summary,
    get_latest_dataset_health,
    get_recent_pipeline_runs,
)


st.set_page_config(page_title="OpenIngest Dashboard", layout="wide")
st.title("OpenIngest Monitoring Dashboard")

kpi = get_dashboard_kpis()
col1, col2, col3, col4, col5 = st.columns(5)
col1.metric("Datasets", kpi["datasets"])
col2.metric("Pipeline Success", f"{kpi['pipeline_success_pct']:.2f}%")
col3.metric("Rows Processed", f"{kpi['rows_processed']:,}")
col4.metric("Quality Score", f"{kpi['quality_score']:.2f}%")
col5.metric("Avg Duration", f"{kpi['average_duration_seconds']:.2f} sec")

st.subheader("Recent Pipeline Runs")
runs = get_recent_pipeline_runs(limit=10)
st.dataframe(runs, use_container_width=True)

st.subheader("Latest Dataset Health")
health = get_latest_dataset_health()
st.dataframe(health, use_container_width=True)

st.subheader("Dataset Trends")
trends = get_dataset_health_trends(limit_runs=20)
st.dataframe(trends, use_container_width=True)

st.subheader("Incremental Summary")
inc = get_incremental_summary()
st.write(pd.DataFrame([inc]))
