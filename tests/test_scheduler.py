"""Tests for core.scheduler — CronExpression parsing and Scheduler logic."""

from __future__ import annotations

import time

import pytest

from core.scheduler import CronExpression, resolve_cron

# ── resolve_cron presets ──────────────────────────────────────────────────────

def test_resolve_daily() -> None:
    assert resolve_cron("@daily") == "0 0 * * *"


def test_resolve_hourly() -> None:
    assert resolve_cron("@hourly") == "0 * * * *"


def test_resolve_weekly() -> None:
    assert resolve_cron("@weekly") == "0 0 * * 0"


def test_resolve_monthly() -> None:
    assert resolve_cron("@monthly") == "0 0 1 * *"


def test_resolve_midnight() -> None:
    assert resolve_cron("@midnight") == "0 0 * * *"


def test_resolve_passthrough_custom() -> None:
    expr = "15 3 * * 1"
    assert resolve_cron(expr) == expr


def test_resolve_case_insensitive() -> None:
    assert resolve_cron("@DAILY") == "0 0 * * *"


# ── CronExpression parsing ────────────────────────────────────────────────────

def test_invalid_cron_raises() -> None:
    with pytest.raises(ValueError, match="Expected 5 fields"):
        CronExpression("0 0 * *")  # only 4 fields


def test_wildcard_matches_any() -> None:
    cron = CronExpression("* * * * *")
    t = time.strptime("2024-06-15 14:30:00", "%Y-%m-%d %H:%M:%S")
    assert cron.matches(t) is True


def test_exact_minute_matches() -> None:
    cron = CronExpression("30 * * * *")
    t = time.strptime("2024-06-15 14:30:00", "%Y-%m-%d %H:%M:%S")
    assert cron.matches(t) is True


def test_exact_minute_no_match() -> None:
    cron = CronExpression("45 * * * *")
    t = time.strptime("2024-06-15 14:30:00", "%Y-%m-%d %H:%M:%S")
    assert cron.matches(t) is False


def test_step_matches() -> None:
    # every 15 minutes: 0, 15, 30, 45
    cron = CronExpression("*/15 * * * *")
    t30 = time.strptime("2024-06-15 14:30:00", "%Y-%m-%d %H:%M:%S")
    t31 = time.strptime("2024-06-15 14:31:00", "%Y-%m-%d %H:%M:%S")
    assert cron.matches(t30) is True
    assert cron.matches(t31) is False


def test_range_matches() -> None:
    # hours 9-17
    cron = CronExpression("0 9-17 * * *")
    t10 = time.strptime("2024-06-15 10:00:00", "%Y-%m-%d %H:%M:%S")
    t20 = time.strptime("2024-06-15 20:00:00", "%Y-%m-%d %H:%M:%S")
    assert cron.matches(t10) is True
    assert cron.matches(t20) is False


def test_list_matches() -> None:
    # minutes 0, 15, 30, 45
    cron = CronExpression("0,15,30,45 * * * *")
    t0  = time.strptime("2024-06-15 14:00:00", "%Y-%m-%d %H:%M:%S")
    t15 = time.strptime("2024-06-15 14:15:00", "%Y-%m-%d %H:%M:%S")
    t7  = time.strptime("2024-06-15 14:07:00", "%Y-%m-%d %H:%M:%S")
    assert cron.matches(t0)  is True
    assert cron.matches(t15) is True
    assert cron.matches(t7)  is False


def test_daily_cron_matches_midnight() -> None:
    cron = CronExpression("0 0 * * *")
    midnight = time.strptime("2024-06-15 00:00:00", "%Y-%m-%d %H:%M:%S")
    noon     = time.strptime("2024-06-15 12:00:00", "%Y-%m-%d %H:%M:%S")
    assert cron.matches(midnight) is True
    assert cron.matches(noon)     is False
