from pathlib import Path
import yaml

CONFIG_DIR = Path(__file__).resolve().parents[1] / "configs"


def _load_yaml(path: Path) -> dict:
    """
    Load a YAML file safely.
    Returns an empty dictionary if the file does not exist.
    """
    if not path.exists():
        return {}

    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    return data or {}


def load_dataset_config() -> dict:
    """
    Load datasets.yaml
    """
    return _load_yaml(CONFIG_DIR / "datasets.yaml")


def load_pipeline_config() -> dict:
    """
    Load pipeline.yaml

    Example:

    cron: "@daily"

    or

    schedule: "0 * * * *"
    """
    return _load_yaml(CONFIG_DIR / "pipeline.yaml")