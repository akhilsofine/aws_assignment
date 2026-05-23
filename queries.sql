-- Mandatory SQL Queries

-- 1. JOIN Query: Get all employees in a team
SELECT e.name, t.team_name
FROM employees e
JOIN employee_teams et ON e.id = et.employee_id
JOIN teams t ON t.id = et.team_id
WHERE t.team_name = 'Finance Team'; -- Example condition

-- 2. Reverse JOIN Query: Get all teams for an employee
SELECT t.team_name, e.name
FROM teams t
JOIN employee_teams et ON t.id = et.team_id
JOIN employees e ON e.id = et.employee_id
WHERE e.id = 1; -- Example condition

-- 3. Aggregation Query: Number of reports uploaded per team
SELECT t.team_name, COUNT(r.id) as number_of_reports
FROM teams t
LEFT JOIN reports r ON t.id = r.team_id
GROUP BY t.id, t.team_name;
