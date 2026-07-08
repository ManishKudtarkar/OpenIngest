from pathlib import Path

import yaml

from utils.project import find_project_root


def get_config_dir() -> Path:
    root = find_project_root()
    return (root or Path.cwd()) / "configs"


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
    Load datasets.yaml from the current OpenIngest project.
    """
    return _load_yaml(get_config_dir() / "datasets.yaml")


def load_pipeline_config() -> dict:
    """
    Load pipeline.yaml from the current OpenIngest project.
    """
    return _load_yaml(get_config_dir() / "pipeline.yaml")
