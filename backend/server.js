const express = require('express');
const db = require('./db');
const { uploadFileToS3 } = require('./s3');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Setup Multer for parsing multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ==========================================
// Employee APIs
// ==========================================
app.post('/employees', async (req, res) => {
    try {
        const { name, email } = req.body;
        const result = await db.query(
            'INSERT INTO employees (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/employees', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM employees');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Team APIs
// ==========================================
app.post('/teams', async (req, res) => {
    try {
        const { team_name } = req.body;
        const result = await db.query(
            'INSERT INTO teams (team_name) VALUES ($1) RETURNING *',
            [team_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/teams', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM teams');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Employee-Team Mapping APIs
// ==========================================
app.post('/teams/:teamId/employees/:employeeId', async (req, res) => {
    try {
        const { teamId, employeeId } = req.params;
        const result = await db.query(
            'INSERT INTO employee_teams (team_id, employee_id) VALUES ($1, $2) RETURNING *',
            [teamId, employeeId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/teams/:teamId/employees', async (req, res) => {
    try {
        const { teamId } = req.params;
        const result = await db.query(
            `SELECT e.* FROM employees e
             JOIN employee_teams et ON e.id = et.employee_id
             WHERE et.team_id = $1`,
            [teamId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/employees/:employeeId/teams', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await db.query(
            `SELECT t.* FROM teams t
             JOIN employee_teams et ON t.id = et.team_id
             WHERE et.employee_id = $1`,
            [employeeId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Report APIs
// ==========================================
app.post('/upload-report', upload.single('file'), async (req, res) => {
    try {
        const { team_id, uploaded_by } = req.body;
        const file = req.file;

        if (!file || !team_id || !uploaded_by) {
            return res.status(400).json({ error: 'Missing required fields: file, team_id, uploaded_by' });
        }

        // Upload to S3
        const { s3Key } = await uploadFileToS3(file.buffer, file.originalname, team_id);

        // Save metadata to RDS
        const result = await db.query(
            `INSERT INTO reports (team_id, uploaded_by, file_name, s3_key, status) 
             VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
            [team_id, uploaded_by, file.originalname, s3Key]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/reports', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reports');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/teams/:teamId/reports', async (req, res) => {
    try {
        const { teamId } = req.params;
        const result = await db.query('SELECT * FROM reports WHERE team_id = $1', [teamId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ALB Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Backend API listening on port ${port}`);
});
