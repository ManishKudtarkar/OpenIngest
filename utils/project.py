from __future__ import annotations

import os
from pathlib import Path


PROJECT_MARKER = ".openingest"
PIPELINE_CONFIG = Path("configs/pipeline.yaml")


def find_project_root(start: Path | None = None) -> Path | None:
    """
    Return the nearest OpenIngest project root, walking upward from start.
    """
    current = (start or Path.cwd()).resolve()

    for candidate in (current, *current.parents):
        if (candidate / PROJECT_MARKER).exists():
            return candidate
        if (candidate / PIPELINE_CONFIG).exists():
            return candidate

    return None


def is_project_root(path: Path | None = None) -> bool:
    return find_project_root(path) == (path or Path.cwd()).resolve()


def require_project_root() -> Path:
    root = find_project_root()
    if root is None:
        raise RuntimeError(
            "Not inside an OpenIngest project. Run `openingest init <project-name>` first, "
            "then `cd <project-name>`."
        )
    return root


def chdir_project_root() -> Path:
    root = require_project_root()
    os.chdir(root)
    return root
