const { Client, Storage, ID } = require("node-appwrite");
const { InputFile } = require("node-appwrite/file");
const fs = require("fs");
const path = require("path");

// Initialize Appwrite SDK
const endpoint =
  process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const bucketId = process.env.APPWRITE_BUCKET_ID;

if (!projectId || !apiKey || !bucketId) {
  console.warn(
    "Appwrite configuration missing. Please check environment variables.",
  );
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const storage = new Storage(client);
const BUCKET_ID = bucketId;

/**
 * Upload a file to Appwrite Storage
 * @param {string} filePath - Local path to the file
 * @param {string} fileName - Original file name
 * @param {string} [targetBucketId] - Optional bucket ID (defaults to env BUCKET_ID)
 * @returns {Promise<string>} - The view URL of the uploaded file
 */
const uploadFile = async (filePath, fileName, targetBucketId = BUCKET_ID) => {
  try {
    if (!projectId || !apiKey || !bucketId) {
      throw new Error(
        "Appwrite configuration missing. Set APPWRITE_PROJECT_ID, APPWRITE_API_KEY, and APPWRITE_BUCKET_ID.",
      );
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at ${filePath}`);
    }

    // Create InputFile from path
    const inputFile = InputFile.fromPath(filePath, fileName);

    // Upload to Appwrite
    const result = await storage.createFile(targetBucketId, ID.unique(), inputFile);

    console.log("Appwrite upload success:", result.$id);

    const viewUrl = `${endpoint}/storage/buckets/${targetBucketId}/files/${result.$id}/view?project=${projectId}`;

    return viewUrl;
  } catch (error) {
    console.error("Appwrite upload error:", error);
    throw error;
  }
};

/**
 * Delete a file from Appwrite Storage
 * @param {string} fileUrlOrId - The file URL or ID
 * @param {string} [targetBucketId] - Optional bucket ID (defaults to env BUCKET_ID)
 */
const deleteFile = async (fileUrlOrId, targetBucketId = BUCKET_ID) => {
  try {
    // Extract ID from URL if provided, otherwise assume it's an ID
    let fileId = fileUrlOrId;
    let bucket = targetBucketId;

    if (fileUrlOrId.includes("/files/")) {
      const matchId = fileUrlOrId.match(/files\/([^/]+)\//);
      if (matchId && matchId[1]) {
        fileId = matchId[1];
      }
      
      // Also try to extract bucket ID from URL
      const matchBucket = fileUrlOrId.match(/buckets\/([^/]+)\//);
      if (matchBucket && matchBucket[1]) {
        bucket = matchBucket[1];
      }
    }

    await storage.deleteFile(bucket, fileId);
    console.log("Appwrite delete success:", fileId, "from bucket:", bucket);
  } catch (error) {
    console.error("Appwrite delete error:", error);
    // Don't throw if file not found, just log
  }
};

module.exports = {
  uploadFile,
  deleteFile,
};
