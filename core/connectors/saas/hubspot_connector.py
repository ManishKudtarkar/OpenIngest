"""
HubSpot CRM source connector.

Reads HubSpot CRM objects (contacts, companies, deals, etc.) via the v3 API.

Requires: requests (already in v2 extras)
Install with: pip install openingest[hubspot]

Config example
--------------
source:
  type: hubspot
  access_token: ${HUBSPOT_ACCESS_TOKEN}
  object: contacts
  properties: [firstname, lastname, email, createdate]
"""

from __future__ import annotations

import os
import time
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


# HubSpot v3 CRM API endpoints
_OBJECT_ENDPOINTS: Dict[str, str] = {
    "contacts": "https://api.hubapi.com/crm/v3/objects/contacts",
    "companies": "https://api.hubapi.com/crm/v3/objects/companies",
    "deals": "https://api.hubapi.com/crm/v3/objects/deals",
    "tickets": "https://api.hubapi.com/crm/v3/objects/tickets",
    "products": "https://api.hubapi.com/crm/v3/objects/products",
    "line_items": "https://api.hubapi.com/crm/v3/objects/line_items",
}


class HubSpotConnector(BaseConnector):
    """
    Read HubSpot CRM records into a DataFrame.

    Config keys
    -----------
    access_token : str
        HubSpot private app access token or ${ENV_VAR}.
    api_key : str, optional
        Legacy HubSpot API key (deprecated — prefer access_token).
    object : str
        CRM object type: contacts, companies, deals, tickets, products, line_items.
    properties : list, optional
        List of property names to fetch. Defaults to all default properties.
    """

    _PAGE_SIZE = 100  # HubSpot max per page

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            import requests  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "requests is required for HubSpot connectors. "
                "Install with: pip install openingest[hubspot]"
            )

        token = _resolve(self.config.get("access_token") or self.config.get("api_key", ""))
        hs_object: str = self.config["object"].lower()
        properties: Optional[List[str]] = self.config.get("properties")

        base_url = _OBJECT_ENDPOINTS.get(hs_object)
        if not base_url:
            base_url = f"https://api.hubapi.com/crm/v3/objects/{hs_object}"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        params: Dict[str, Any] = {"limit": self._PAGE_SIZE}
        if properties:
            params["properties"] = ",".join(properties)

        all_records: List[Dict[str, Any]] = []
        after: Optional[str] = None

        while True:
            if after:
                params["after"] = after

            try:
                resp = requests.get(base_url, headers=headers, params=params, timeout=30)
            except Exception as exc:
                raise ConnectorError(
                    f"Network error fetching HubSpot {hs_object}: {exc}"
                ) from exc

            if not resp.ok:
                raise ConnectorError(
                    f"HubSpot API error {resp.status_code} for {hs_object}: {resp.text[:500]}"
                )

            data = resp.json()
            results = data.get("results", [])

            for record in results:
                flat: Dict[str, Any] = {"id": record.get("id")}
                flat.update(record.get("properties", {}))
                all_records.append(flat)

            # Cursor-based pagination
            paging = data.get("paging", {})
            next_page = paging.get("next", {})
            after = next_page.get("after")
            if not after or not results:
                break

            time.sleep(0.05)  # Respect rate limits

        return pd.DataFrame(all_records) if all_records else pd.DataFrame()

    def validate_config(self) -> None:
        if not self.config.get("access_token") and not self.config.get("api_key"):
            raise ConnectorError(
                "HubSpotConnector requires 'access_token' (or legacy 'api_key') in source config."
            )
        if not self.config.get("object"):
            raise ConnectorError("HubSpotConnector requires 'object' in source config.")
