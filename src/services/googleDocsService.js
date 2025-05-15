// File: src/services/googleDocsService.js

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const logger = require('../utils/logger');

/**
 * Creates a new Google Document
 * @param {string} title - Document title
 * @param {Array} requests - Google Docs API requests for document content
 * @param {Object} credentials - OAuth credentials with access_token
 * @returns {Promise<Object>} Created document info
 */
exports.createGoogleDoc = async (title, requests, credentials) => {
  try {
    // Initialize Google API client with provided OAuth credentials
    const client = getGoogleAuthFromOAuthCredentials(credentials);
    const docs = google.docs({ version: 'v1', auth: client });
    
    // Create a new empty document
    logger.info(`Creating new Google Doc with title: ${title}`);
    const document = await docs.documents.create({
      requestBody: {
        title
      }
    });
    
    const documentId = document.data.documentId;
    
    // If there are content requests, update the document
    if (requests && requests.length > 0) {
      logger.info(`Updating document ${documentId} with content (${requests.length} requests)`);
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests
        }
      });
    }
    
    logger.info(`Successfully created Google Doc with ID: ${documentId}`);
    
    return {
      documentId,
      documentUrl: `https://docs.google.com/document/d/${documentId}/edit`
    };
  } catch (error) {
    logger.error(`Error creating Google Doc: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Gets document metadata
 * @param {string} documentId - Google Doc ID
 * @param {Object} credentials - OAuth credentials with access_token
 * @returns {Promise<Object>} Document metadata
 */
exports.getDocumentMetadata = async (documentId, credentials) => {
  try {
    // Initialize Google API client with provided credentials
    const client = getGoogleAuthFromOAuthCredentials(credentials);
    const docs = google.docs({ version: 'v1', auth: client });
    
    // Get document metadata
    const response = await docs.documents.get({
      documentId
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error getting document metadata: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Gets Google Auth client from provided OAuth credentials
 * @param {Object} credentials - OAuth credentials with access_token
 * @returns {OAuth2Client} Authenticated OAuth2 client
 */
function getGoogleAuthFromOAuthCredentials(credentials) {
  try {
    // Create OAuth2 client
    const oauth2Client = new OAuth2Client();
    
    // Set credentials directly - only access_token is required
    oauth2Client.setCredentials({
      access_token: credentials.access_token,
      token_type: credentials.token_type || 'Bearer'
    });
    
    return oauth2Client;
  } catch (error) {
    logger.error(`Error setting up OAuth2 client: ${error.message}`, { stack: error.stack });
    throw new Error(`Failed to setup OAuth2 client: ${error.message}`);
  }
}