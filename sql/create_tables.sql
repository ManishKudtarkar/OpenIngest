-- =========================
-- Drop analytics tables
-- =========================
DROP TABLE IF EXISTS customer_revenue_summary;
DROP TABLE IF EXISTS country_sales_summary;
DROP TABLE IF EXISTS daily_sales_summary;

-- =========================
-- Drop warehouse tables
-- =========================
DROP TABLE IF EXISTS fact_orders;
DROP TABLE IF EXISTS dim_products;
DROP TABLE IF EXISTS dim_customers;

-- =========================
-- Drop staging tables
-- =========================
DROP TABLE IF EXISTS stg_orders;
DROP TABLE IF EXISTS stg_products;
DROP TABLE IF EXISTS stg_customers;

-- =========================
-- Staging tables
-- =========================
CREATE TABLE stg_customers (
    customer_id INT,
    name VARCHAR(150),
    email VARCHAR(150),
    country VARCHAR(10),
    age INT,
    signup_date DATE,
    marketing_opt_in BOOLEAN
);

CREATE TABLE stg_products (
    product_id INT,
    category VARCHAR(100),
    name VARCHAR(200),
    price_usd NUMERIC(10,2),
    cost_usd NUMERIC(10,2),
    margin_usd NUMERIC(10,2)
);

CREATE TABLE stg_orders (
    order_id INT,
    customer_id INT,
    order_time TIMESTAMP,
    payment_method VARCHAR(50),
    discount_pct NUMERIC(5,2),
    subtotal_usd NUMERIC(10,2),
    total_usd NUMERIC(10,2),
    country VARCHAR(10),
    device VARCHAR(50),
    source VARCHAR(50)
);

-- =========================
-- Warehouse tables
-- =========================
CREATE TABLE dim_customers (
    customer_key SERIAL PRIMARY KEY,
    customer_id INT UNIQUE,
    name VARCHAR(150),
    email VARCHAR(150),
    country VARCHAR(10),
    age INT,
    signup_date DATE,
    marketing_opt_in BOOLEAN
);

CREATE TABLE dim_products (
    product_key SERIAL PRIMARY KEY,
    product_id INT UNIQUE,
    category VARCHAR(100),
    name VARCHAR(200),
    price_usd NUMERIC(10,2),
    cost_usd NUMERIC(10,2),
    margin_usd NUMERIC(10,2)
);

CREATE TABLE fact_orders (
    order_key SERIAL PRIMARY KEY,
    order_id INT UNIQUE,
    customer_id INT,
    order_time TIMESTAMP,
    payment_method VARCHAR(50),
    discount_pct NUMERIC(5,2),
    subtotal_usd NUMERIC(10,2),
    total_usd NUMERIC(10,2),
    country VARCHAR(10),
    device VARCHAR(50),
    source VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS stg_sessions (

    session_id TEXT PRIMARY KEY,

    customer_id TEXT,

    start_time TIMESTAMP,

    device TEXT,

    source TEXT,

    country TEXT

);