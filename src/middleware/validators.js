// File: src/middleware/validators.js

const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validates markdown payload
 */
exports.validateMarkdownPayload = [
  body('docName')
    .trim()
    .notEmpty()
    .withMessage('Document name is required')
    .isString()
    .withMessage('Document name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Document name must be between 1 and 255 characters'),
  
  body('markdown')
    .notEmpty()
    .withMessage('Markdown content is required')
    .isString()
    .withMessage('Markdown content must be a string'),
    
  body('credentials')
    .notEmpty()
    .withMessage('OAuth credentials are required')
    .isObject()
    .withMessage('Credentials must be an object'),
    
  body('credentials.access_token')
    .notEmpty()
    .withMessage('access_token is required in credentials')
    .isString()
    .withMessage('access_token must be a string'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation error for markdown payload', { errors: errors.array() });
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];