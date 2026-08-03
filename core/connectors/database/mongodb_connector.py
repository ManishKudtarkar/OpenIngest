"""
MongoDB source connector.

Reads documents from a MongoDB collection and returns a flat DataFrame.

Requires: pymongo
Install with: pip install openingest[mongodb]

Config example
--------------
source:
  type: mongodb
  uri: ${MONGODB_URI}
  database: mydb
  collection: orders
  filter: {"status": "active"}      # optional MongoDB filter document
  projection: {"_id": 0, "name": 1} # optional field projection
  limit: 10000                       # optional row cap
  include_id: false                  # set true to keep _id column
"""

from __future__ import annotations

import os
import re
from typing import Any

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


def _redact_uri(uri: str) -> str:
    """Remove password from MongoDB URI for safe error messages."""
    return re.sub(r"(?<=://)([^:]+):([^@]+)@", r"\1:***@", uri)


class MongoDBConnector(BaseConnector):
    """
    Read documents from a MongoDB collection into a DataFrame.

    Config keys
    -----------
    uri : str
        MongoDB connection URI or ${ENV_VAR}. E.g. mongodb://user:pass@host:27017/
    database : str
        Database name.
    collection : str
        Collection name.
    filter : dict, optional
        MongoDB query filter document. Defaults to {} (all documents).
    projection : dict, optional
        MongoDB projection document to limit fields.
    limit : int, optional
        Maximum number of documents to return.
    include_id : bool, optional
        Whether to include the _id field. Defaults to False.
    """

    def read(self) -> pd.DataFrame:
        self.validate_config()

        try:
            from pymongo import MongoClient  # type: ignore[import]
        except ImportError:
            raise ConnectorError(
                "pymongo is required for MongoDB connectors. "
                "Install with: pip install openingest[mongodb]"
            )

        uri = _resolve(self.config.get("uri", ""))
        database: str = self.config["database"]
        collection: str = self.config["collection"]
        query_filter: dict[str, Any] = self.config.get("filter") or {}
        projection: dict[str, Any] | None = self.config.get("projection")
        limit: int = int(self.config.get("limit", 0))
        include_id: bool = bool(self.config.get("include_id", False))

        # Build projection — suppress _id by default
        if projection is None:
            projection = {} if include_id else {"_id": 0}
        elif not include_id and "_id" not in projection:
            projection["_id"] = 0

        try:
            client: Any = MongoClient(uri, serverSelectionTimeoutMS=10_000)
            client.server_info()  # force connection check
        except Exception as exc:
            raise ConnectorError(
                f"Failed to connect to MongoDB at {_redact_uri(uri)}: {exc}"
            ) from exc

        try:
            coll = client[database][collection]
            cursor = coll.find(query_filter, projection)
            if limit:
                cursor = cursor.limit(limit)
            documents = list(cursor)
        except Exception as exc:
            raise ConnectorError(
                f"Failed to read from MongoDB collection '{collection}': {exc}"
            ) from exc
        finally:
            client.close()

        if not documents:
            return pd.DataFrame()

        return pd.json_normalize(documents)

    def validate_config(self) -> None:
        for key in ("database", "collection"):
            if not self.config.get(key):
                raise ConnectorError(f"MongoDBConnector requires '{key}' in source config.")
        if not self.config.get("uri"):
            raise ConnectorError("MongoDBConnector requires 'uri' in source config.")
