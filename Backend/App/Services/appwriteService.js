const { Client, Storage, ID, InputFile } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Initialize Appwrite SDK
const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const bucketId = process.env.APPWRITE_BUCKET_ID;

if (!projectId || !apiKey || !bucketId) {
    console.warn('Appwrite configuration missing. Please check environment variables.');
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
 * @returns {Promise<string>} - The view URL of the uploaded file
 */
const uploadFile = async (filePath, fileName) => {
    try {
        if (!projectId || !apiKey || !bucketId) {
            throw new Error('Appwrite configuration missing. Set APPWRITE_PROJECT_ID, APPWRITE_API_KEY, and APPWRITE_BUCKET_ID.');
        }

        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at ${filePath}`);
        }

        // Create InputFile from path
        const inputFile = InputFile.fromPath(filePath, fileName);

        // Upload to Appwrite
        const result = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            inputFile
        );

        console.log('Appwrite upload success:', result.$id);

        // Get the view URL
        // Note: This returns the API URL. If you need a public URL, ensure permissions are set.
        // Format: https://cloud.appwrite.io/v1/storage/buckets/[BUCKET_ID]/files/[FILE_ID]/view?project=[PROJECT_ID]
        // But the SDK doesn't have a direct 'getFileViewUrl' method that returns the full string easily without construction,
        // although 'getFileView' returns the binary. 
        // We construct the URL manually or use the endpoint.
        
        const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
        const projectId = process.env.APPWRITE_PROJECT_ID;
        
        const viewUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${result.$id}/view?project=${projectId}&mode=admin`;
        
        return viewUrl;
    } catch (error) {
        console.error('Appwrite upload error:', error);
        throw error;
    }
};

/**
 * Delete a file from Appwrite Storage
 * @param {string} fileUrlOrId - The file URL or ID
 */
const deleteFile = async (fileUrlOrId) => {
    try {
        // Extract ID from URL if provided, otherwise assume it's an ID
        let fileId = fileUrlOrId;
        if (fileUrlOrId.includes('/files/')) {
            const match = fileUrlOrId.match(/files\/([^/]+)\//);
            if (match && match[1]) {
                fileId = match[1];
            }
        }

        await storage.deleteFile(BUCKET_ID, fileId);
        console.log('Appwrite delete success:', fileId);
    } catch (error) {
        console.error('Appwrite delete error:', error);
        // Don't throw if file not found, just log
    }
};

module.exports = {
    uploadFile,
    deleteFile
};
