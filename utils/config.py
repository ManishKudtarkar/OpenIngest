import os
from dotenv import load_dotenv

load_dotenv()

_raw_url = os.getenv("DATABASE_URL")

if not _raw_url:
    raise ValueError("DATABASE_URL not found in .env file")

DATABASE_URL: str = _raw_url