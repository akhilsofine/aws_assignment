const { Client } = require('pg');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'us-east-1' });

// Database connection logic for Lambda
const getDbClient = async () => {
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'assignment_db',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
    });
    await client.connect();
    return client;
};

exports.handler = async (event, context) => {
    console.log("Daily Team Report Processor Started");
    let client;

    try {
        client = await getDbClient();

        // 1. Fetch all pending reports
        const pendingReportsResult = await client.query(`
            SELECT id, team_id, file_name, s3_key 
            FROM reports 
            WHERE status = 'pending'
        `);

        const reports = pendingReportsResult.rows;
        console.log(`Found ${reports.length} pending reports.`);

        const bucketName = process.env.S3_BUCKET_NAME || 'team-report-storage';

        for (const report of reports) {
            console.log(`Processing report ID: ${report.id}, S3 Key: ${report.s3_key}`);
            
            try {
                // 2. Read file from S3
                const getObjectParams = {
                    Bucket: bucketName,
                    Key: report.s3_key,
                };
                
                const s3Object = await s3.getObject(getObjectParams).promise();
                const fileContent = s3Object.Body.toString('utf-8');
                
                // 3. Count rows/lines
                const lineCount = fileContent.split('\n').length;
                console.log(`Report ID ${report.id} has ${lineCount} lines.`);

                // 4. Move file: pending -> processed
                // Example s3_key: team-1/pending/169123456_file.csv
                // New key: team-1/processed/169123456_file.csv
                const newS3Key = report.s3_key.replace('/pending/', '/processed/');

                await s3.copyObject({
                    Bucket: bucketName,
                    CopySource: `${bucketName}/${report.s3_key}`,
                    Key: newS3Key
                }).promise();

                await s3.deleteObject({
                    Bucket: bucketName,
                    Key: report.s3_key
                }).promise();

                console.log(`Moved object from ${report.s3_key} to ${newS3Key}`);

                // 5. Update report status
                await client.query(`
                    UPDATE reports 
                    SET status = 'processed', processed_at = CURRENT_TIMESTAMP, s3_key = $1
                    WHERE id = $2
                `, [newS3Key, report.id]);
                
                console.log(`Successfully processed report ID: ${report.id}`);

            } catch (err) {
                console.error(`Error processing report ID: ${report.id}`, err);
                
                // Log failed processing for bonus task
                await client.query(`
                    INSERT INTO processing_logs (report_id, log_message)
                    VALUES ($1, $2)
                `, [report.id, err.message]);
            }
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify('Processing complete.'),
        };

    } catch (err) {
        console.error("Handler error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify('Error during processing.'),
        };
    } finally {
        if (client) {
            await client.end();
        }
    }
};
