git push -u origin main# AWS Multi-Team Report Processing Platform

This project implements a backend API and serverless processing pipeline for a Multi-Team Report Management System, as per the AWS Cloud Assignment.

## Architecture and Infrastructure

- **EC2 + Application Load Balancer (ALB)**: The Node.js Express API (`backend/server.js`) should be deployed on an EC2 instance. An ALB routes traffic to the EC2 target group and provides the DNS name to access the APIs.
- **Relational Database Service (RDS)**: A Multi-AZ RDS PostgreSQL instance stores metadata.
- **S3 Bucket**: A bucket named `team-report-storage` stores the uploaded reports in `pending` and `processed` folders.
- **AWS Lambda**: The `lambda/index.js` script processes pending reports from S3 by counting their lines, updates the RDS, and moves them to the `processed` folder.
- **EventBridge**: Triggers the Lambda function every minute using the cron expression `cron(* * * * ? *)`.

## Setup and Deployment

### 1. Database (RDS PostgreSQL)
Run the SQL scripts provided in `schema.sql` against your RDS instance to create the necessary tables. Sample queries for your assignments are in `queries.sql`.

### 2. Backend API
1. Navigate to the `backend` folder.
2. Run `npm install`.
3. Set the following environment variables:
   - `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`
   - `AWS_REGION`
   - `S3_BUCKET_NAME`
4. Start the server: `node server.js`

### 3. AWS Lambda Processor
1. Navigate to the `lambda` folder.
2. Zip the contents (including `node_modules` after running `npm install`).
3. Upload the zip to your AWS Lambda function (`daily-team-report-processor`).
4. Set the same Database and S3 environment variables on the Lambda configuration.
5. Create an EventBridge Rule:
   - **Schedule**: `cron(* * * * ? *)`
   - **Target**: Your Lambda function.

## API Documentation

### Employee APIs
- `POST /employees`
  - Body: `{ "name": "John Doe", "email": "john@example.com" }`
- `GET /employees`

### Team APIs
- `POST /teams`
  - Body: `{ "team_name": "Analytics Team" }`
- `GET /teams`

### Employee-Team Mapping APIs
- `POST /teams/:teamId/employees/:employeeId`
  - Maps an employee to a team (Many-to-Many).
- `GET /teams/:teamId/employees`
  - Lists all employees in a specific team.
- `GET /employees/:employeeId/teams`
  - Lists all teams for a specific employee.

### Report APIs
- `POST /upload-report`
  - Content-Type: `multipart/form-data`
  - Form Fields: 
    - `file`: (The report file)
    - `team_id`: (ID of the team)
    - `uploaded_by`: (Employee ID)
- `GET /reports`
- `GET /teams/:teamId/reports`
