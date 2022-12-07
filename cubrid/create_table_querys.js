module.exports.create_tables_query = "CREATE TABLE IF NOT EXISTS tn_aply_dc (" +
    "    job_id VARCHAR(255) NOT NULL PRIMARY KEY," +
    "    job_status VARCHAR(10) NOT NULL," +
    "    service_status VARCHAR(10) NOT NULL," +
    "    app_key VARCHAR(255) NOT NULL," +
    "    member_no VARCHAR(255) NOT NULL," +
    "    contract_no VARCHAR(255) NOT NULL," +
    "    svc_name VARCHAR(255) NOT NULL," +
    "    display_name VARCHAR(255) NOT NULL," +
    "    bill_plan VARCHAR(255) NOT NULL," +
    "    total_price INTEGER NOT NULL," +
    "    month_price INTEGER NOT NULL," +
    "    year_month_price INTEGER NOT NULL," +
    "    year_penalty_rate INTEGER NOT NULL," +
    "    service_key VARCHAR(255) NOT NULL," +
    "    create_dttm DATETIME NOT NULL," +
    "    updt_dttm DATETIME NOT NULL" +
    ");" +
    "CREATE TABLE IF NOT EXISTS tn_aply_dc_opt (" +
    "    seq INTEGER NOT NULL PRIMARY KEY," +
    "    member_no VARCHAR(255) NOT NULL," +
    "    [key] VARCHAR(255) NOT NULL," +
    "    name VARCHAR(255) NOT NULL," +
    "    [count] VARCHAR(255) NOT NULL," +
    "    free_count VARCHAR(255) NOT NULL," +
    "    svc_count VARCHAR(255) NOT NULL," +
    "    price VARCHAR(255) NOT NULL," +
    "    job_id VARCHAR(255) NOT NULL" +
    ");" +
    "CREATE TABLE IF NOT EXISTS tn_aply_dc_opt2 (" +
    "    seq INTEGER NOT NULL PRIMARY KEY," +
    "    member_no VARCHAR(255) NOT NULL," +
    "    [key] VARCHAR(255) NOT NULL," +
    "    name VARCHAR(255) NOT NULL," +
    "    [value] VARCHAR(255) NOT NULL," +
    "    job_id VARCHAR(255) NOT NULL" +
    ");" +
    "CREATE TABLE IF NOT EXISTS tn_job_status (" +
    "    job_id VARCHAR(255) NOT NULL PRIMARY KEY," +
    "    job_status VARCHAR(10) NOT NULL," +
    "    create_dttm DATETIME NOT NULL" +
    ");";
    



