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
    const { docName, markdown, credentials } = req.body;
    
    // Validate input
    if (!docName || !markdown) {
      logger.error('Missing required fields: docName or markdown');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: docName or markdown' 
      });
    }
    
    // Validate credentials
    if (!credentials || !credentials.access_token) {
      logger.error('Missing or invalid OAuth credentials');
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid OAuth credentials'
      });
    }
    
    // Process markdown to Google Docs format
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