// File: src/controllers/markdownController.js

const { processMarkdown } = require('../utils/markdownProcessor');
const { createGoogleDoc } = require('../services/googleDocsService');
const logger = require('../utils/logger');

/**
 * Converts markdown to Google Docs format and creates a new document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.convertMarkdownToGoogleDoc = async (req, res) => {
  try {
    const { docName, markdown } = req.body;
    
    // Validate input
    if (!docName || !markdown) {
      logger.error('Missing required fields: docName or markdown');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: docName or markdown' 
      });
    }
    
    // Extract OAuth token from Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('Missing or invalid Authorization header');
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid Authorization header. Please use OAuth2 authentication.'
      });
    }
    
    // Extract token
    const accessToken = authHeader.replace('Bearer ', '');
    
    // Create credentials object
    const credentials = {
      access_token: accessToken,
      token_type: 'Bearer'
    };
    
    // Process markdown to Google Docs format using the more reliable formatter
    logger.info('Processing markdown to Google Docs format');
    const { requests } = processMarkdown(markdown);
    
    // Create a new document using Google Docs API with provided credentials
    logger.info(`Creating Google Doc with name: ${docName}`);
    const docInfo = await createGoogleDoc(docName, requests, credentials);
    
    logger.info(`Successfully created Google Doc: ${docName} (ID: ${docInfo.documentId})`);
    return res.status(201).json({
      success: true,
      message: 'Google Doc created successfully',
      docId: docInfo.documentId,
      docUrl: docInfo.documentUrl
    });
  } catch (error) {
    logger.error(`Error converting markdown to Google Doc: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      error: 'Failed to convert markdown to Google Doc',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};