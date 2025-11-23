import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'intouch-recordings';

/**
 * Upload a file to S3
 * @param {string} filePath - Local file path
 * @param {string} key - S3 object key
 * @returns {Promise<string>} - S3 URL
 */
export async function uploadToS3(filePath, key) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: getContentType(filePath)
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    
    // Delete local file after upload
    fs.unlinkSync(filePath);
    
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

/**
 * Get a signed URL for temporary access to S3 object
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Promise<string>} - Signed URL
 */
export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * Delete a file from S3
 * @param {string} key - S3 object key
 */
export async function deleteFromS3(key) {
  try {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
}

/**
 * Upload interview recording to S3
 * @param {string} interviewId - Interview ID
 * @param {string} filePath - Local file path
 * @returns {Promise<object>} - Upload result with URL and key
 */
export async function uploadInterviewRecording(interviewId, filePath) {
  const timestamp = Date.now();
  const ext = path.extname(filePath);
  const key = `recordings/${interviewId}/${timestamp}${ext}`;
  
  const url = await uploadToS3(filePath, key);
  
  return {
    url,
    key,
    bucket: BUCKET_NAME
  };
}

/**
 * Upload transcription file to S3
 * @param {string} interviewId - Interview ID
 * @param {string} transcription - Transcription text
 * @returns {Promise<object>} - Upload result
 */
export async function uploadTranscription(interviewId, transcription) {
  const timestamp = Date.now();
  const key = `transcriptions/${interviewId}/${timestamp}.txt`;
  
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: transcription,
    ContentType: 'text/plain'
  };
  
  await s3Client.send(new PutObjectCommand(uploadParams));
  
  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  
  return {
    url,
    key,
    bucket: BUCKET_NAME
  };
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.txt': 'text/plain',
    '.json': 'application/json'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

