from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from utils.config import get_database_url


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    return create_engine(get_database_url())
