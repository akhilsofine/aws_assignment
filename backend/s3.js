const AWS = require('aws-sdk');

// Set AWS region explicitly
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

const s3 = new AWS.S3();

const uploadFileToS3 = async (fileBuffer, fileName, teamId) => {
    // S3 Requirements: Folder structure /team-1/pending
    const s3Key = `team-${teamId}/pending/${Date.now()}_${fileName}`;
    const bucketName = process.env.S3_BUCKET_NAME || 'team-report-storage';

    const params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer
    };

    const result = await s3.upload(params).promise();
    return {
        s3Key: result.Key,
        location: result.Location
    };
};

module.exports = { uploadFileToS3, s3 };
