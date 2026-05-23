# AWS Multi-Team Report Processing Platform

A scalable cloud-native backend system built using AWS services, Node.js, Express, PostgreSQL, and Terraform for managing teams, employees, and automated report processing workflows.

This project demonstrates Infrastructure as Code (IaC), serverless processing, cloud storage management, and REST API development using modern AWS architecture.

---

# Project Architecture

## Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Backend Runtime |
| Express.js | REST API Framework |
| PostgreSQL | Relational Database |
| AWS EC2 | Backend Hosting |
| Application Load Balancer (ALB) | Traffic Routing |
| AWS RDS | Managed PostgreSQL Database |
| Amazon S3 | File Storage |
| AWS Lambda | Serverless Processing |
| EventBridge | Scheduled Automation |
| Terraform | Infrastructure Provisioning |

---

# System Workflow

1. Employees and Teams are created using REST APIs.
2. Employees are mapped to Teams.
3. Reports are uploaded through backend APIs.
4. Uploaded reports are stored in the S3 `pending/` folder.
5. EventBridge triggers the Lambda function every minute.
6. Lambda processes reports by:
   - Reading report contents
   - Counting lines
   - Updating metadata in RDS
   - Moving processed reports to `processed/`

---

# Project Structure

```bash
aws assignment/
│
├── backend/
│   ├── server.js
│   ├── package.json
│
├── lambda/
│   ├── index.js
│   ├── package.json
│
├── terraform/
│   ├── main.tf
│   ├── ec2_alb.tf
│   ├── iam.tf
│   ├── lambda.tf
│   ├── rds.tf
│   ├── s3.tf
│
├── schema.sql
├── queries.sql
├── ER_Diagram.md
├── Architecture_Diagram.png
├── README.md
```

---

# Infrastructure as Code (Terraform)

Terraform was used to automate provisioning and configuration of AWS resources.

## Provisioned Resources

- EC2 Instance
- Application Load Balancer
- Target Groups
- Security Groups
- RDS PostgreSQL Database
- S3 Bucket
- Lambda Function
- IAM Roles and Policies
- EventBridge Scheduler

---

# Terraform Setup

## Initialize Terraform

```bash
terraform init
```

## Validate Configuration

```bash
terraform validate
```

## Preview Infrastructure

```bash
terraform plan
```

## Apply Infrastructure

```bash
terraform apply
```

---

# Backend Setup

## Navigate to Backend Folder

```bash
cd backend
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file:

```env
DB_USER=your_db_user
DB_HOST=your_rds_endpoint
DB_NAME=your_db_name
DB_PASSWORD=your_password
DB_PORT=5432

AWS_REGION=your_region
S3_BUCKET_NAME=team-report-storage
```

## Run Server

```bash
node server.js
```

---

# Database Setup

Create a PostgreSQL RDS instance and execute:

```sql
schema.sql
```

Sample SQL queries are available in:

```sql
queries.sql
```

---

# S3 Bucket Structure

```bash
team-report-storage/
│
├── pending/
├── processed/
```

---

# Lambda Setup

## Navigate to Lambda Folder

```bash
cd lambda
```

## Install Dependencies

```bash
npm install
```

## Create Deployment Package

```bash
zip -r lambda.zip .
```

## Upload to AWS Lambda

Lambda Function Name:

```bash
daily-team-report-processor
```

---

# EventBridge Scheduler

Configure EventBridge Rule with:

```bash
cron(* * * * ? *)
```

This triggers the Lambda function every minute.

---

# API Documentation

# Employee APIs

## Create Employee

```http
POST /employees
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

## Get All Employees

```http
GET /employees
```

---

# Team APIs

## Create Team

```http
POST /teams
```

### Request Body

```json
{
  "team_name": "Analytics Team"
}
```

---

## Get All Teams

```http
GET /teams
```

---

# Employee-Team Mapping APIs

## Assign Employee to Team

```http
POST /teams/:teamId/employees/:employeeId
```

---

## Get Employees in Team

```http
GET /teams/:teamId/employees
```

---

## Get Teams for Employee

```http
GET /employees/:employeeId/teams
```

---

# Report APIs

## Upload Report

```http
POST /upload-report
```

### Content-Type

```bash
multipart/form-data
```

### Form Fields

| Field | Description |
|---|---|
| file | Report File |
| team_id | Team ID |
| uploaded_by | Employee ID |

---

## Get All Reports

```http
GET /reports
```

---

## Get Reports by Team

```http
GET /teams/:teamId/reports
```

---

# Testing APIs

Example cURL request:

```bash
curl -X GET http://<ALB-DNS>/employees
```

---

# Deployment Verification

The following components were successfully tested:

- EC2 Backend Deployment
- Application Load Balancer Routing
- PostgreSQL RDS Connectivity
- S3 File Uploads
- Lambda Execution
- EventBridge Scheduling
- REST API Responses

---

# Future Enhancements

- JWT Authentication
- Docker Containerization
- CI/CD Pipeline
- CloudWatch Monitoring
- Terraform Remote State Management

---

# Author

Akhil Raj.R

---

# License

This project was created for educational and academic purposes.