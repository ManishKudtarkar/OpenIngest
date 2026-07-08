from __future__ import annotations

from importlib import resources
from pathlib import Path


TEMPLATE_PACKAGE = "openingest.templates"


def _copy_template_tree(target: Path, project_name: str) -> None:
    root = resources.files(TEMPLATE_PACKAGE) / "project"

    def copy_item(item, relative: Path) -> None:
        destination = target / relative

        if item.is_dir():
            destination.mkdir(parents=True, exist_ok=True)
            for child in item.iterdir():
                copy_item(child, relative / child.name)
            return

        destination.parent.mkdir(parents=True, exist_ok=True)
        content = item.read_bytes()

        if item.name in {"README.md"}:
            text = content.decode("utf-8").replace("{{ project_name }}", project_name)
            destination.write_text(text, encoding="utf-8")
        else:
            destination.write_bytes(content)

    for child in root.iterdir():
        copy_item(child, Path(child.name))


def run_init(project_name: str) -> int:
    target = Path(project_name).expanduser()

    if target.exists():
        print(f"Error: '{target}' already exists.")
        return 1

    _copy_template_tree(target, target.name)

    for directory in [
        "configs",
        "data/raw",
        "reports",
        "logs",
        "plugins",
        "sql",
    ]:
        (target / directory).mkdir(parents=True, exist_ok=True)

    marker = target / ".openingest"
    if not marker.exists():
        marker.write_text("version: 1\n", encoding="utf-8")

    print(f"\nCreated OpenIngest project: {target}/\n")
    print("  .openingest             project marker")
    print("  configs/datasets.yaml   register your datasets here")
    print("  configs/pipeline.yaml   pipeline settings")
    print("  data/raw/               drop your source files here")
    print("  plugins/                add project-specific extensions")
    print("  .env                    set your DATABASE_URL")
    print("  docker-compose.yml      start PostgreSQL with docker compose up -d")
    print()
    print("Next steps:")
    print(f"  cd {target}")
    print("  docker compose up -d")
    print("  openingest doctor")
    print("  openingest infer customers.csv")
    print("  openingest run")
    print()

    return 0
