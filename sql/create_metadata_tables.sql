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

    auto_created_table BOOLEAN DEFAULT FALSE,

    status VARCHAR(20),

    loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pipeline_quality_runs (

    id SERIAL PRIMARY KEY,

    run_id VARCHAR(50),

    dataset_name VARCHAR(100),

    target_table VARCHAR(100),

    rows_checked BIGINT,

    checks_total INTEGER,

    checks_passed INTEGER,

    checks_failed INTEGER,

    score DOUBLE PRECISION,

    status VARCHAR(20),

    details TEXT,

    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);