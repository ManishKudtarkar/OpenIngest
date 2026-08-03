"""
Google Sheets source connector.

Reads a Google Sheets spreadsheet into a DataFrame using the Sheets API v4.

Requires: google-api-python-client, google-auth
Install with: pip install openingest[google_sheets]

Config example
--------------
source:
  type: google_sheets
  spreadsheet_id: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
  sheet_name: Sheet1       # optional, defaults to first sheet
  range: A1:Z1000          # optional cell range
  service_account_file: ${GOOGLE_SERVICE_ACCOUNT_FILE}
  # OR use inline JSON:
  # service_account_json: ${GOOGLE_SERVICE_ACCOUNT_JSON}
"""

from __future__ import annotations

import json
import os

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


_SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]


class GoogleSheetsConnector(BaseConnector):
    """
    Read a Google Sheets spreadsheet into a DataFrame.

    Config keys
    -----------
    spreadsheet_id : str
        The Google Sheets spreadsheet ID from the URL.
    sheet_name : str, optional
        Sheet/tab name. Defaults to the first sheet.
    range : str, optional
        A1 notation range (e.g. A1:D100). Defaults to all data.
    service_account_file : str, optional
        Path to service account JSON file or ${ENV_VAR}.
    service_account_json : str, optional
        Inline service account JSON string or ${ENV_VAR}.
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            from google.oauth2 import service_account  # type: ignore[import]
            from googleapiclient.discovery import build  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "google-api-python-client and google-auth are required for Google Sheets connectors. "
                "Install with: pip install openingest[google_sheets]"
            )

        # Build credentials
        try:
            if self.config.get("service_account_file"):
                cred_path = _resolve(self.config["service_account_file"])
                credentials = service_account.Credentials.from_service_account_file(
                    cred_path, scopes=_SCOPES
                )
            elif self.config.get("service_account_json"):
                cred_json = _resolve(self.config["service_account_json"])
                info = json.loads(cred_json)
                credentials = service_account.Credentials.from_service_account_info(
                    info, scopes=_SCOPES
                )
            else:
                raise ConnectorError(
                    "GoogleSheetsConnector requires either 'service_account_file' "
                    "or 'service_account_json' in source config."
                )
        except ConnectorError:
            raise
        except Exception as exc:
            raise ConnectorError(
                f"Google Sheets authentication failed: {exc}"
            ) from exc

        spreadsheet_id: str = self.config["spreadsheet_id"]
        sheet_name: str | None = self.config.get("sheet_name")
        cell_range: str | None = self.config.get("range")

        try:
            service = build("sheets", "v4", credentials=credentials)
            sheets_api = service.spreadsheets()

            # Resolve sheet name if not provided
            if not sheet_name:
                meta = sheets_api.get(spreadsheetId=spreadsheet_id).execute()
                sheet_name = meta["sheets"][0]["properties"]["title"]

            range_notation = f"'{sheet_name}'!{cell_range}" if cell_range else sheet_name

            result = sheets_api.values().get(
                spreadsheetId=spreadsheet_id,
                range=range_notation,
            ).execute()

            rows: list[list[str]] = result.get("values", [])
        except ConnectorError:
            raise
        except Exception as exc:
            raise ConnectorError(
                f"Failed to read Google Sheets spreadsheet '{spreadsheet_id}': {exc}"
            ) from exc

        if not rows:
            return pd.DataFrame()

        headers = rows[0]
        data_rows = rows[1:]

        # Pad short rows to match header length
        padded = [row + [""] * (len(headers) - len(row)) for row in data_rows]
        return pd.DataFrame(padded, columns=headers)

    def validate_config(self) -> None:
        if not self.config.get("spreadsheet_id"):
            raise ConnectorError(
                "GoogleSheetsConnector requires 'spreadsheet_id' in source config."
            )
        if not self.config.get("service_account_file") and not self.config.get("service_account_json"):
            raise ConnectorError(
                "GoogleSheetsConnector requires either 'service_account_file' "
                "or 'service_account_json' in source config."
            )
