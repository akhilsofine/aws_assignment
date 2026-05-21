-- Database Schema for AWS Cloud Assignment

-- 1. Employees Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE
);

-- 2. Teams Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100)
);

-- 3. Junction Table (Mandatory)
CREATE TABLE employee_teams (
    employee_id INT REFERENCES employees(id),
    team_id INT REFERENCES teams(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (employee_id, team_id)
);

-- 4. Reports Table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id),
    uploaded_by INT REFERENCES employees(id),
    file_name VARCHAR(255),
    s3_key VARCHAR(500),
    status VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- 5. Processing Logs Table (Bonus/Requirement for logs)
CREATE TABLE processing_logs (
    id SERIAL PRIMARY KEY,
    report_id INT REFERENCES reports(id),
    log_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
