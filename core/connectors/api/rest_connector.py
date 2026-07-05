"""
REST API connector.

Fetches data from any HTTP/HTTPS endpoint and returns a DataFrame.

Supports:
  - GET and POST requests
  - Bearer token / API key authentication
  - Environment variable expansion in headers and params
  - Automatic pagination (offset-based or cursor-based)
  - JSON response normalization via record_path

Requires: requests
Install with: pip install requests

Config example
--------------
source:
  type: rest
  url: https://api.company.com/orders
  method: GET
  headers:
    Authorization: Bearer ${ORDERS_API_TOKEN}
    Accept: application/json
  params:
    limit: 500
    status: active
  record_path: data       # path to the array in the JSON response
  pagination:
    type: offset           # 'offset' or 'cursor'
    param: offset          # query param name for offset
    limit_param: limit     # query param name for page size
    limit: 500             # rows per page
    max_pages: 20          # safety limit
"""

from __future__ import annotations

import os
import time
from typing import Any, Dict, List, Optional

import pandas as pd

from core.connectors.base import BaseConnector, ConnectorError


def _resolve_env_in_str(value: str) -> str:
    """Expand ${VAR_NAME} references in a string."""
    if not isinstance(value, str):
        return value
    if value.startswith("${") and value.endswith("}"):
        var = value[2:-1]
        resolved = os.environ.get(var)
        if resolved is None:
            raise ConnectorError(
                f"Environment variable '{var}' is not set. "
                f"Set it before running OpenIngest: export {var}=..."
            )
        return resolved
    return value


def _resolve_env_in_dict(d: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively expand ${VAR} references in all string values of a dict."""
    return {k: _resolve_env_in_str(str(v)) if isinstance(v, str) else v for k, v in d.items()}


def _get_nested(obj: Any, path: str) -> Any:
    """Navigate a dot-separated key path through a nested dict/list."""
    current = obj
    for part in path.split("."):
        if isinstance(current, dict):
            current = current.get(part)
        elif isinstance(current, list) and part.isdigit():
            current = current[int(part)]
        else:
            return None
    return current


class RestApiConnector(BaseConnector):
    """
    Fetch data from a REST API endpoint into a DataFrame.

    Config keys
    -----------
    url : str
        Full URL of the endpoint.
    method : str, optional
        HTTP method: 'GET' (default) or 'POST'.
    headers : dict, optional
        Request headers. Values may use ${ENV_VAR} expansion.
    params : dict, optional
        Query parameters for GET requests.
    body : dict, optional
        JSON request body for POST requests.
    record_path : str, optional
        Dot-separated path to the array of records in the JSON response.
        Example: "data" for {"data": [...]}
        Example: "results.items" for {"results": {"items": [...]}}
    timeout : int, optional
        Request timeout in seconds. Defaults to 30.
    retry_count : int, optional
        Number of retries on network errors. Defaults to 3.
    retry_delay : float, optional
        Seconds to wait between retries. Defaults to 1.0.
    pagination : dict, optional
        Pagination config (see below).
    verify_ssl : bool, optional
        Whether to verify SSL certificates. Defaults to True.

    Pagination config (offset-based)
    ---------------------------------
    pagination:
      type: offset
      param: offset           # query param name for the offset counter
      limit_param: limit      # query param name for page size
      limit: 500              # rows per page
      max_pages: 50           # safety limit to prevent infinite loops

    Pagination config (cursor-based)
    ---------------------------------
    pagination:
      type: cursor
      cursor_path: meta.next_cursor   # path to next cursor in response JSON
      param: cursor                   # query param name to pass cursor
      max_pages: 50

    Example
    -------
    source:
      type: rest
      url: https://api.stripe.com/v1/charges
      method: GET
      headers:
        Authorization: Bearer ${STRIPE_API_KEY}
      record_path: data
      pagination:
        type: cursor
        cursor_path: has_more
        param: starting_after
        max_pages: 100
    """

    RETRY_STATUS_CODES = {429, 500, 502, 503, 504}

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            import requests  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "requests is required for REST API connectors. "
                "Install with: pip install requests"
            )

        url: str = self.config["url"]
        method: str = self.config.get("method", "GET").upper()
        headers: Dict[str, str] = _resolve_env_in_dict(self.config.get("headers", {}))
        params: Dict[str, Any] = dict(self.config.get("params", {}))
        body: Optional[Dict[str, Any]] = self.config.get("body")
        record_path: Optional[str] = self.config.get("record_path")
        timeout: int = int(self.config.get("timeout", 30))
        retry_count: int = int(self.config.get("retry_count", 3))
        retry_delay: float = float(self.config.get("retry_delay", 1.0))
        verify_ssl: bool = bool(self.config.get("verify_ssl", True))

        pagination = self.config.get("pagination")

        if pagination:
            all_records = self._fetch_paginated(
                requests=requests,
                url=url,
                method=method,
                headers=headers,
                params=params,
                body=body,
                record_path=record_path,
                pagination=pagination,
                timeout=timeout,
                verify_ssl=verify_ssl,
            )
            return pd.json_normalize(all_records) if all_records else pd.DataFrame()

        # Single-page fetch
        raw = self._fetch_with_retry(
            requests=requests,
            url=url,
            method=method,
            headers=headers,
            params=params,
            body=body,
            timeout=timeout,
            retry_count=retry_count,
            retry_delay=retry_delay,
            verify_ssl=verify_ssl,
        )

        return self._to_dataframe(raw, record_path)

    def _fetch_with_retry(
        self,
        requests: Any,
        url: str,
        method: str,
        headers: Dict[str, str],
        params: Dict[str, Any],
        body: Optional[Dict[str, Any]],
        timeout: int,
        retry_count: int,
        retry_delay: float,
        verify_ssl: bool,
    ) -> Any:
        last_exc: Optional[Exception] = None

        for attempt in range(retry_count + 1):
            try:
                if method == "GET":
                    resp = requests.get(url, headers=headers, params=params, timeout=timeout, verify=verify_ssl)
                elif method == "POST":
                    resp = requests.post(url, headers=headers, json=body or {}, timeout=timeout, verify=verify_ssl)
                else:
                    raise ConnectorError(f"Unsupported HTTP method: '{method}'. Use GET or POST.")

                if resp.status_code in self.RETRY_STATUS_CODES and attempt < retry_count:
                    time.sleep(retry_delay * (attempt + 1))
                    continue

                if not resp.ok:
                    raise ConnectorError(
                        f"API request failed: {resp.status_code} {resp.reason} — {url}\n"
                        f"Response: {resp.text[:500]}"
                    )

                return resp.json()

            except ConnectorError:
                raise
            except Exception as exc:
                last_exc = exc
                if attempt < retry_count:
                    time.sleep(retry_delay)
                    continue
                raise ConnectorError(
                    f"Network error fetching '{url}' (attempt {attempt + 1}): {exc}"
                ) from exc

        raise ConnectorError(f"All {retry_count + 1} attempts failed for '{url}'.") from last_exc

    def _fetch_paginated(
        self,
        requests: Any,
        url: str,
        method: str,
        headers: Dict[str, str],
        params: Dict[str, Any],
        body: Optional[Dict[str, Any]],
        record_path: Optional[str],
        pagination: Dict[str, Any],
        timeout: int,
        verify_ssl: bool,
    ) -> List[Any]:
        page_type: str = pagination.get("type", "offset")
        max_pages: int = int(pagination.get("max_pages", 50))
        all_records: List[Any] = []

        if page_type == "offset":
            limit: int = int(pagination.get("limit", 500))
            offset_param: str = pagination.get("param", "offset")
            limit_param: str = pagination.get("limit_param", "limit")
            current_offset = 0

            for page in range(max_pages):
                page_params = {**params, limit_param: limit, offset_param: current_offset}
                raw = self._fetch_with_retry(
                    requests=requests, url=url, method=method, headers=headers,
                    params=page_params, body=body, timeout=timeout,
                    retry_count=3, retry_delay=1.0, verify_ssl=verify_ssl,
                )
                records = self._extract_records(raw, record_path)
                all_records.extend(records)

                if not records or len(records) < limit:
                    break  # Last page

                current_offset += limit

        elif page_type == "cursor":
            cursor_path: str = pagination.get("cursor_path", "next_cursor")
            cursor_param: str = pagination.get("param", "cursor")
            cursor: Optional[str] = None

            for page in range(max_pages):
                page_params = {**params}
                if cursor:
                    page_params[cursor_param] = cursor

                raw = self._fetch_with_retry(
                    requests=requests, url=url, method=method, headers=headers,
                    params=page_params, body=body, timeout=timeout,
                    retry_count=3, retry_delay=1.0, verify_ssl=verify_ssl,
                )
                records = self._extract_records(raw, record_path)
                all_records.extend(records)

                next_cursor = _get_nested(raw, cursor_path)
                if not next_cursor or not records:
                    break
                cursor = str(next_cursor)

        return all_records

    def _extract_records(self, raw: Any, record_path: Optional[str]) -> List[Any]:
        if record_path:
            data = _get_nested(raw, record_path)
            if data is None:
                return []
            if isinstance(data, list):
                return data
            return [data]
        if isinstance(raw, list):
            return raw
        return [raw]

    def _to_dataframe(self, raw: Any, record_path: Optional[str]) -> pd.DataFrame:
        records = self._extract_records(raw, record_path)
        if not records:
            return pd.DataFrame()
        try:
            return pd.json_normalize(records)
        except Exception as exc:
            raise ConnectorError(f"Failed to normalize API response to DataFrame: {exc}") from exc

    def validate_config(self) -> None:
        if not self.config.get("url"):
            raise ConnectorError("RestApiConnector requires 'url' in source config.")
