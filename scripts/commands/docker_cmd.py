from pathlib import Path


DOCKER_COMPOSE = """\
version: "3.9"

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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U openingest"]
      interval: 5s
      retries: 5

  airflow-init:
    image: apache/airflow:2.9.0
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://openingest:openingest@postgres/openingest
      AIRFLOW__CORE__LOAD_EXAMPLES: "false"
    command: db init
    volumes:
      - ./dags:/opt/airflow/dags

  airflow-webserver:
    image: apache/airflow:2.9.0
    depends_on:
      - airflow-init
    environment:
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://openingest:openingest@postgres/openingest
      AIRFLOW__CORE__LOAD_EXAMPLES: "false"
    ports:
      - "8080:8080"
    command: webserver
    volumes:
      - ./dags:/opt/airflow/dags

  airflow-scheduler:
    image: apache/airflow:2.9.0
    depends_on:
      - airflow-init
    environment:
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://openingest:openingest@postgres/openingest
      AIRFLOW__CORE__LOAD_EXAMPLES: "false"
    command: scheduler
    volumes:
      - ./dags:/opt/airflow/dags

volumes:
  postgres_data:
"""


def run_docker_init() -> int:
    path = Path("docker-compose.yml")
    if path.exists():
        answer = input("  docker-compose.yml already exists. Overwrite? (Y/N): ").strip().lower()
        if answer != "y":
            print("  Skipped.\n")
            return 0

    path.write_text(DOCKER_COMPOSE, encoding="utf-8")

    print("\n  Created: docker-compose.yml\n")
    print("  Services:")
    print("    postgres          -> localhost:5432")
    print("    airflow-webserver -> http://localhost:8080")
    print("    airflow-scheduler")
    print("\n  Start with:")
    print("    docker compose up -d\n")
    return 0
