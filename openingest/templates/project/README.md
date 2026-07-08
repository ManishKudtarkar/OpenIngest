# {{ project_name }}

Data ingestion project powered by OpenIngest.

## Quick start

```bash
docker compose up -d
cp your_data.csv data/raw/
openingest infer your_data.csv
openingest run
```

## Common commands

```bash
openingest doctor
openingest add-dataset
openingest validate
openingest quality
openingest run
openingest report
openingest dashboard
openingest history
openingest graph
openingest airflow build
openingest docker init
openingest scheduler start
```
