import uuid
from datetime import datetime


def generate_run_id() -> str:

    return (
        "OI-"
        + datetime.now().strftime("%Y%m%d")
        + "-"
        + uuid.uuid4().hex[:6].upper()
    )