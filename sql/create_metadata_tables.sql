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

    load_strategy VARCHAR(20),

    load_mode VARCHAR(20),

    incremental_column VARCHAR(100),

    watermark_value TEXT,

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

CREATE TABLE IF NOT EXISTS pipeline_incremental_state (

    dataset_name VARCHAR(100) PRIMARY KEY,

    target_table VARCHAR(100),

    load_strategy VARCHAR(20),

    primary_key_columns TEXT,

    incremental_column VARCHAR(100),

    hash_columns TEXT,

    last_watermark_value TEXT,

    last_rows_loaded BIGINT,

    last_source_rows BIGINT,

    last_loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);