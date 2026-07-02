from pathlib import Path
import yaml


CONFIG_DIR = Path(__file__).resolve().parents[1] / "configs"


def load_dataset_config():
    config_file = CONFIG_DIR / "datasets.yaml"

    with open(config_file, "r") as f:
        return yaml.safe_load(f)