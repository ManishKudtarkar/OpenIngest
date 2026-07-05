from pathlib import Path


DATASETS_YAML = """\
datasets:

  # Example dataset — replace with your own
  customers:
    file: customers.csv
    staging_table: stg_customers
    load_strategy: replace

    primary_key:
      - customer_id

    required_columns:
      - customer_id
      - name
      - email

    non_null_columns:
      - customer_id
      - email
"""

ENV_FILE = """\
# OpenIngest environment configuration
DATABASE_URL=postgresql://user:password@localhost:5432/openingest
"""

README = """\
# {name}

Data ingestion project powered by [OpenIngest](https://github.com/manishkudtarkar/OpenIngest).

## Quick start

```bash
# Add your CSV files
cp your_data.csv data/raw/

# Register the dataset
openingest add-dataset

# Run the pipeline
openingest run
```

## Commands

```bash
openingest run              # Run full pipeline
openingest run --dry-run    # Validate only, no DB writes
openingest validate         # Schema validation
openingest quality          # Quality checks
openingest report           # Latest execution report
openingest history          # Run history
openingest doctor           # Check environment health
```
"""

DOCKER_COMPOSE = """\
version: "3.8"

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: openingest
      POSTGRES_PASSWORD: openingest
      POSTGRES_DB: openingest
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
"""


def run_init(project_name: str) -> int:
    target = Path(project_name)

    if target.exists():
        print(f"Error: '{project_name}' already exists.")
        return 1

    dirs = [
        target / "configs",
        target / "data" / "raw",
        target / "data" / "processed",
        target / "reports",
        target / "logs",
        target / "sql",
    ]

    for d in dirs:
        d.mkdir(parents=True)

    (target / "configs" / "datasets.yaml").write_text(DATASETS_YAML)
    (target / ".env").write_text(ENV_FILE)
    (target / "README.md").write_text(README.format(name=project_name))
    (target / "docker-compose.yml").write_text(DOCKER_COMPOSE)
    (target / "data" / "raw" / ".gitkeep").write_text("")
    (target / "reports" / ".gitkeep").write_text("")
    (target / "logs" / ".gitkeep").write_text("")

    print(f"\nCreated project: {project_name}/\n")
    print("  configs/datasets.yaml   — register your datasets here")
    print("  data/raw/               — drop your CSV files here")
    print("  .env                    — set your DATABASE_URL")
    print("  docker-compose.yml      — start PostgreSQL with docker compose up -d")
    print()
    print("Next steps:")
    print(f"  cd {project_name}")
    print("  # Edit .env with your DATABASE_URL")
    print("  # Copy CSV files into data/raw/")
    print("  openingest add-dataset")
    print("  openingest run")
    print()

    return 0
