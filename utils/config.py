import os

from dotenv import load_dotenv

from utils.project import find_project_root


def get_database_url() -> str:
    root = find_project_root()
    env_path = root / ".env" if root else None

    if env_path and env_path.exists():
        load_dotenv(env_path)
    else:
        load_dotenv()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError(
            "DATABASE_URL not found. Set it in your OpenIngest project's .env file "
            "or in the environment."
        )

    return database_url
