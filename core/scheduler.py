"""
OpenIngest built-in scheduler (v2.5).

Runs the pipeline on a cron schedule without requiring Apache Airflow.
Designed for users who want simple periodic execution without full Airflow.

Usage
-----
CLI:
    openingest run --schedule "0 * * * *"     # run at top of every hour
    openingest scheduler start                 # start daemon using pipeline.yaml schedule

Python:
    from core.scheduler import Scheduler
    s = Scheduler(cron_expression="0 0 * * *")
    s.start()

Requires: schedule (pip install schedule)

Cron presets
------------
    @hourly    →  0 * * * *
    @daily     →  0 0 * * *
    @weekly    →  0 0 * * 0
    @monthly   →  0 0 1 * *
    @midnight  →  0 0 * * *
"""

from __future__ import annotations

import logging
import signal
import time
from typing import Callable, Optional

logger = logging.getLogger("openingest.scheduler")

CRON_PRESETS = {
    "@hourly":   "0 * * * *",
    "@daily":    "0 0 * * *",
    "@midnight": "0 0 * * *",
    "@weekly":   "0 0 * * 0",
    "@monthly":  "0 0 1 * *",
}


def resolve_cron(expression: str) -> str:
    """Convert a preset alias to a standard 5-field cron expression."""
    return CRON_PRESETS.get(expression.strip().lower(), expression.strip())


class CronExpression:
    """
    Minimal 5-field cron parser.

    Fields: minute hour day-of-month month day-of-week

    Supports:
        *          — any value
        N          — specific value
        */N        — step (every N units)
        N,M        — list of values
        N-M        — range
    """

    def __init__(self, expression: str) -> None:
        self.raw = expression
        parts = expression.split()
        if len(parts) != 5:
            raise ValueError(
                f"Invalid cron expression: '{expression}'. "
                f"Expected 5 fields: minute hour day month weekday"
            )
        self.minute, self.hour, self.dom, self.month, self.dow = parts

    def matches(self, t: "time.struct_time") -> bool:
        return (
            self._field_matches(self.minute, t.tm_min,  0, 59)
            and self._field_matches(self.hour,   t.tm_hour, 0, 23)
            and self._field_matches(self.dom,    t.tm_mday, 1, 31)
            and self._field_matches(self.month,  t.tm_mon,  1, 12)
            and self._field_matches(self.dow,    t.tm_wday, 0, 6)
        )

    @staticmethod
    def _field_matches(field: str, value: int, lo: int, hi: int) -> bool:
        if field == "*":
            return True

        # Step: */N or start/N
        if "/" in field:
            left, step_str = field.split("/", 1)
            step = int(step_str)
            start = lo if left == "*" else int(left)
            return value >= start and (value - start) % step == 0

        # Range: N-M
        if "-" in field and "," not in field:
            a, b = field.split("-", 1)
            return int(a) <= value <= int(b)

        # List: N,M,O
        if "," in field:
            return value in {int(x) for x in field.split(",")}

        # Exact: N
        return value == int(field)


class Scheduler:
    """
    Lightweight cron scheduler for OpenIngest.

    Parameters
    ----------
    cron_expression : str
        5-field cron string or preset alias (@daily, @hourly, etc.)
    pipeline_fn : callable, optional
        Function to call on each tick. Defaults to `core.pipeline.run_pipeline`.
    dry_run : bool, optional
        If True, passes dry_run=True to the pipeline.
    """

    def __init__(
        self,
        cron_expression: str,
        pipeline_fn: Optional[Callable[[], None]] = None,
        dry_run: bool = False,
    ) -> None:
        raw = resolve_cron(cron_expression)
        self.cron = CronExpression(raw)
        self.dry_run = dry_run
        self._running = False

        if pipeline_fn is not None:
            self._pipeline_fn = pipeline_fn
        else:
            from core.pipeline import run_pipeline
            self._pipeline_fn = lambda: run_pipeline(dry_run=self.dry_run)

    def start(self) -> None:
        """
        Start the blocking scheduler loop.
        Runs until Ctrl+C or SIGTERM.
        """
        self._running = True
        _register_signal_handlers(self._stop)

        logger.info("OpenIngest scheduler started. Cron: '%s'", self.cron.raw)
        print(f"[scheduler] Running on schedule: {self.cron.raw}")
        print("[scheduler] Press Ctrl+C to stop.\n")

        last_minute: Optional[int] = None

        try:
            while self._running:
                now = time.localtime()
                current_minute = now.tm_min

                # Fire once per matching minute (not every second within it)
                if current_minute != last_minute and self.cron.matches(now):
                    last_minute = current_minute
                    logger.info("Scheduler tick — running pipeline")
                    print(f"[scheduler] Tick at {time.strftime('%Y-%m-%d %H:%M', now)}")
                    try:
                        self._pipeline_fn()
                    except Exception as exc:
                        logger.error("Pipeline failed during scheduled run: %s", exc)
                        print(f"[scheduler] Pipeline error: {exc}")

                time.sleep(10)  # Check every 10 seconds

        except KeyboardInterrupt:
            print("\n[scheduler] Stopped by user.")

        self._running = False

    def _stop(self) -> None:
        self._running = False


def _register_signal_handlers(stop_fn: Callable[[], None]) -> None:
    def _handler(signum: int, frame: object) -> None:  # noqa: ARG001
        print(f"\n[scheduler] Received signal {signum}. Shutting down...")
        stop_fn()

    signal.signal(signal.SIGTERM, _handler)
    # SIGINT is handled by KeyboardInterrupt in the loop
