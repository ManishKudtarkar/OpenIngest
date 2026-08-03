"""
Stripe source connector.

Reads Stripe resource lists (charges, customers, invoices, subscriptions, etc.)
via the Stripe REST API with automatic cursor-based pagination.

Requires: requests (already in v2 extras)
Install with: pip install openingest[stripe]

Config example
--------------
source:
  type: stripe
  api_key: ${STRIPE_API_KEY}
  resource: charges
  limit: 10000
  created_after: "2024-01-01T00:00:00"
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import pandas as pd

from core.connectors.base import BaseConnector, ConnectorError


def _resolve(value: str) -> str:
    if isinstance(value, str) and value.startswith("${") and value.endswith("}"):
        var = value[2:-1]
        resolved = os.environ.get(var)
        if resolved is None:
            raise ConnectorError(
                f"Environment variable '{var}' is not set. "
                f"Add it to your .env file: {var}=..."
            )
        return resolved
    return str(value) if value is not None else value


_STRIPE_BASE = "https://api.stripe.com/v1"

_SUPPORTED_RESOURCES = [
    "charges", "customers", "invoices", "subscriptions",
    "payment_intents", "products", "prices", "refunds",
    "balance_transactions", "events",
]


class StripeConnector(BaseConnector):
    """
    Read Stripe resource records into a DataFrame.

    Config keys
    -----------
    api_key : str
        Stripe secret API key or ${ENV_VAR}.
    resource : str
        Resource name: charges, customers, invoices, subscriptions, etc.
    limit : int, optional
        Maximum total records to return. Defaults to all records.
    created_after : str, optional
        ISO-8601 timestamp — only return records created after this time.
    """

    _PAGE_SIZE = 100  # Stripe max per page

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            import requests  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "requests is required for Stripe connectors. "
                "Install with: pip install openingest[stripe]"
            )

        api_key = _resolve(self.config["api_key"])
        resource: str = self.config["resource"]
        max_records: Optional[int] = self.config.get("limit")
        created_after: Optional[str] = self.config.get("created_after")

        url = f"{_STRIPE_BASE}/{resource}"
        headers = {"Authorization": f"Bearer {api_key}"}

        params: Dict[str, Any] = {"limit": self._PAGE_SIZE}

        if created_after:
            try:
                dt = datetime.fromisoformat(created_after.replace("Z", "+00:00"))
                params["created[gt]"] = int(dt.replace(tzinfo=timezone.utc).timestamp())
            except ValueError:
                raise ConnectorError(
                    f"Invalid created_after format: '{created_after}'. "
                    f"Use ISO-8601, e.g. '2024-01-01T00:00:00'."
                )

        all_records: List[Dict[str, Any]] = []
        starting_after: Optional[str] = None

        while True:
            if starting_after:
                params["starting_after"] = starting_after

            try:
                resp = requests.get(url, headers=headers, params=params, timeout=30)
            except Exception as exc:
                raise ConnectorError(f"Network error fetching Stripe {resource}: {exc}") from exc

            if not resp.ok:
                body = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                err = body.get("error", {})
                raise ConnectorError(
                    f"Stripe API error {resp.status_code} — "
                    f"{err.get('type', 'unknown')}: {err.get('message', resp.text[:300])}"
                )

            data = resp.json()
            page = data.get("data", [])
            all_records.extend(page)

            if max_records and len(all_records) >= max_records:
                all_records = all_records[:max_records]
                break

            if not data.get("has_more") or not page:
                break

            starting_after = page[-1]["id"]
            time.sleep(0.05)

        return pd.json_normalize(all_records) if all_records else pd.DataFrame()

    def validate_config(self) -> None:
        if not self.config.get("api_key"):
            raise ConnectorError("StripeConnector requires 'api_key' in source config.")
        if not self.config.get("resource"):
            raise ConnectorError("StripeConnector requires 'resource' in source config.")
