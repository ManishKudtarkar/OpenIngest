"""
Salesforce source connector.

Reads Salesforce objects via SOQL using the username-password OAuth2 flow.

Requires: simple-salesforce
Install with: pip install openingest[salesforce]

Config example
--------------
source:
  type: salesforce
  username: ${SF_USERNAME}
  password: ${SF_PASSWORD}
  security_token: ${SF_SECURITY_TOKEN}
  client_id: ${SF_CLIENT_ID}
  client_secret: ${SF_CLIENT_SECRET}
  object: Opportunity
  fields: [Id, Name, Amount, StageName, CloseDate]
  where_clause: "StageName = 'Closed Won'"
  # OR use raw SOQL:
  soql: "SELECT Id, Name, Amount FROM Opportunity WHERE StageName = 'Closed Won'"
"""

from __future__ import annotations

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


class SalesforceConnector(BaseConnector):
    """
    Read Salesforce objects into a DataFrame via SOQL.

    Config keys
    -----------
    username : str
        Salesforce username or ${ENV_VAR}.
    password : str
        Salesforce password or ${ENV_VAR}.
    security_token : str
        Salesforce security token or ${ENV_VAR}.
    client_id : str, optional
        Connected App client_id (consumer key) or ${ENV_VAR}.
    client_secret : str, optional
        Connected App client_secret (consumer secret) or ${ENV_VAR}.
    object : str, optional
        Salesforce object name (e.g. Opportunity, Account). Required if soql not set.
    soql : str, optional
        Raw SOQL query string. Takes precedence over object/fields/where_clause.
    fields : list, optional
        List of fields to SELECT. Defaults to all fields (FIELDS(ALL)).
    where_clause : str, optional
        WHERE clause appended to the SOQL query.
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            from simple_salesforce import Salesforce  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "simple-salesforce is required for Salesforce connectors. "
                "Install with: pip install openingest[salesforce]"
            )

        username = _resolve(self.config["username"])
        password = _resolve(self.config["password"])
        security_token = _resolve(self.config["security_token"])
        consumer_key = _resolve(self.config["client_id"]) if self.config.get("client_id") else None
        consumer_secret = _resolve(self.config["client_secret"]) if self.config.get("client_secret") else None

        try:
            sf_kwargs: dict = {
                "username": username,
                "password": password,
                "security_token": security_token,
            }
            if consumer_key:
                sf_kwargs["consumer_key"] = consumer_key
            if consumer_secret:
                sf_kwargs["consumer_secret"] = consumer_secret
            sf = Salesforce(**sf_kwargs)
        except Exception as exc:
            raise ConnectorError(
                f"Salesforce authentication failed: {exc}"
            ) from exc

        soql = self.config.get("soql")
        if not soql:
            sf_object: str = self.config["object"]
            fields: list[str] | None = self.config.get("fields")
            where_clause: str | None = self.config.get("where_clause")

            if fields:
                fields_str = ", ".join(fields)
            else:
                # Describe the object to get all field names
                try:
                    desc = getattr(sf, sf_object).describe()
                    fields_str = ", ".join(f["name"] for f in desc["fields"])
                except Exception:  # noqa: BLE001
                    fields_str = "FIELDS(ALL)"

            soql = f"SELECT {fields_str} FROM {sf_object}"
            if where_clause:
                soql += f" WHERE {where_clause}"

        try:
            result = sf.query_all(soql)
            records = result.get("records", [])
            if not records:
                return pd.DataFrame()
            # Remove Salesforce metadata fields
            df = pd.DataFrame(records)
            drop_cols = [c for c in df.columns if c in ("attributes",) or c.startswith("attributes")]
            df = df.drop(columns=drop_cols, errors="ignore")
            return df
        except Exception as exc:
            raise ConnectorError(
                f"Failed to execute SOQL '{soql[:100]}...': {exc}"
            ) from exc

    def validate_config(self) -> None:
        for key in ("username", "password", "security_token"):
            if not self.config.get(key):
                raise ConnectorError(f"SalesforceConnector requires '{key}' in source config.")
        if not self.config.get("soql") and not self.config.get("object"):
            raise ConnectorError(
                "SalesforceConnector requires either 'soql' or 'object' in source config."
            )
