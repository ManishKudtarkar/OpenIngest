CREATE TABLE IF NOT EXISTS pipeline_runs (

    run_id VARCHAR(50) PRIMARY KEY,

    started_at TIMESTAMP,

    finished_at TIMESTAMP,

    status VARCHAR(20),

    total_datasets INTEGER,

    total_rows BIGINT,

    total_duration DOUBLE PRECISION

);

CREATE TABLE IF NOT EXISTS pipeline_dataset_runs (

    id SERIAL PRIMARY KEY,

    run_id VARCHAR(50),

    dataset_name VARCHAR(100),

    target_table VARCHAR(100),

    rows_loaded BIGINT,

    duration_seconds DOUBLE PRECISION,

    status VARCHAR(20),

    loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);