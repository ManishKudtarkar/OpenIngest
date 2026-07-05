"""
OpenIngest notification system (v2.5).

Sends pipeline success/failure alerts via Slack webhook or email (SMTP).

Configuration (pipeline.yaml or environment variables)
-------------------------------------------------------
notifications:
  slack:
    webhook: ${SLACK_WEBHOOK_URL}
    channel: "#data-engineering"    # optional, overrides webhook default
    on: [success, failure]           # default: [success, failure]

  email:
    smtp_host: smtp.gmail.com
    smtp_port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
    from: openingest@company.com
    to:
      - data-team@company.com
    on: [failure]                    # only alert on failure

Usage
-----
    from core.notifications import NotificationManager
    from utils.config_loader import load_pipeline_config

    config = load_pipeline_config()
    nm = NotificationManager(config.get("notifications", {}))
    nm.notify(run)   # called automatically by pipeline.py
"""

from __future__ import annotations

import json
import logging
import os
import smtplib
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, List

logger = logging.getLogger("openingest.notifications")


def _resolve_env(value: str) -> str:
    if isinstance(value, str) and value.startswith("${") and value.endswith("}"):
        var = value[2:-1]
        resolved = os.environ.get(var, "")
        if not resolved:
            logger.warning("Notification env var '%s' is not set.", var)
        return resolved
    return str(value) if value else ""


class NotificationManager:
    """
    Sends pipeline run notifications via configured channels.

    Parameters
    ----------
    config : dict
        Notifications config block from pipeline.yaml.
        Expected keys: 'slack', 'email'.

    Example
    -------
    nm = NotificationManager({
        "slack": {"webhook": "${SLACK_WEBHOOK_URL}"},
        "email": {...},
    })
    nm.notify(run)
    """

    def __init__(self, config: Dict[str, Any]) -> None:
        self.config = config or {}

    def notify(self, run: Any) -> None:
        """
        Send notifications for a completed pipeline run.

        Parameters
        ----------
        run : PipelineRun
            The completed pipeline run object with status, run_id, etc.
        """
        status: str = str(getattr(run, "status", "UNKNOWN")).upper()
        event = "success" if status == "SUCCESS" else "failure"

        slack_cfg = self.config.get("slack")
        if slack_cfg:
            on_events: List[str] = [e.lower() for e in slack_cfg.get("on", ["success", "failure"])]
            if event in on_events:
                self._send_slack(slack_cfg, run)

        email_cfg = self.config.get("email")
        if email_cfg:
            on_events = [e.lower() for e in email_cfg.get("on", ["success", "failure"])]
            if event in on_events:
                self._send_email(email_cfg, run)

    # ──────────────────────────────────────
    # Slack
    # ──────────────────────────────────────

    def _send_slack(self, slack_cfg: Dict[str, Any], run: Any) -> None:
        webhook = _resolve_env(slack_cfg.get("webhook", ""))
        if not webhook:
            logger.error("Slack notification skipped: 'webhook' is not configured.")
            return

        message = self._build_slack_message(run)

        try:
            payload = json.dumps(message).encode("utf-8")
            req = urllib.request.Request(
                webhook,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    logger.info("Slack notification sent for run %s", getattr(run, "run_id", "?"))
                else:
                    logger.error("Slack webhook returned %s", resp.status)
        except Exception as exc:
            logger.error("Failed to send Slack notification: %s", exc)

    def _build_slack_message(self, run: Any) -> Dict[str, Any]:
        status = str(getattr(run, "status", "UNKNOWN")).upper()
        run_id = getattr(run, "run_id", "N/A")
        total_rows = getattr(run, "total_rows", 0)
        duration = getattr(run, "total_duration", 0)
        datasets = getattr(run, "datasets", [])
        dataset_count = len(datasets) if datasets else 0

        color = "#22C55E" if status == "SUCCESS" else "#EF4444"
        icon = "✅" if status == "SUCCESS" else "❌"

        return {
            "attachments": [
                {
                    "color": color,
                    "blocks": [
                        {
                            "type": "header",
                            "text": {
                                "type": "plain_text",
                                "text": f"{icon} OpenIngest — Pipeline {status}",
                            },
                        },
                        {
                            "type": "section",
                            "fields": [
                                {"type": "mrkdwn", "text": f"*Run ID*\n`{run_id}`"},
                                {"type": "mrkdwn", "text": f"*Status*\n{status}"},
                                {"type": "mrkdwn", "text": f"*Datasets*\n{dataset_count}"},
                                {"type": "mrkdwn", "text": f"*Rows Loaded*\n{total_rows:,}"},
                                {"type": "mrkdwn", "text": f"*Duration*\n{duration:.2f}s"},
                            ],
                        },
                    ],
                }
            ]
        }

    # ──────────────────────────────────────
    # Email
    # ──────────────────────────────────────

    def _send_email(self, email_cfg: Dict[str, Any], run: Any) -> None:
        smtp_host: str = email_cfg.get("smtp_host", "")
        smtp_port: int = int(email_cfg.get("smtp_port", 587))
        username: str = _resolve_env(email_cfg.get("username", ""))
        password: str = _resolve_env(email_cfg.get("password", ""))
        from_addr: str = email_cfg.get("from", username)
        to_addrs: List[str] = email_cfg.get("to", [])

        if not smtp_host or not to_addrs:
            logger.error(
                "Email notification skipped: 'smtp_host' and 'to' are required."
            )
            return

        subject, body = self._build_email_content(run)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_addr
        msg["To"] = ", ".join(to_addrs)
        msg.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                if username and password:
                    server.login(username, password)
                server.sendmail(from_addr, to_addrs, msg.as_string())
            logger.info("Email notification sent to %s", to_addrs)
        except Exception as exc:
            logger.error("Failed to send email notification: %s", exc)

    def _build_email_content(self, run: Any) -> tuple[str, str]:
        status = str(getattr(run, "status", "UNKNOWN")).upper()
        run_id = getattr(run, "run_id", "N/A")
        total_rows = getattr(run, "total_rows", 0)
        duration = getattr(run, "total_duration", 0)
        datasets = getattr(run, "datasets", [])
        dataset_count = len(datasets)

        icon = "✅" if status == "SUCCESS" else "❌"
        subject = f"{icon} OpenIngest Pipeline: {status} — {run_id}"

        body = f"""OpenIngest Pipeline Run Report
{'=' * 40}

Pipeline : {status}
Run ID   : {run_id}
Datasets : {dataset_count}
Rows     : {total_rows:,}
Duration : {duration:.2f} sec

{'=' * 40}
"""
        return subject, body
