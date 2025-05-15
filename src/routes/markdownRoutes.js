// File: src/routes/markdownRoutes.js

const express = require('express');
const router = express.Router();
const markdownController = require('../controllers/markdownController');
const { validateMarkdownPayload } = require('../middleware/validators');

/**
 * @route POST /api/markdown/convert-to-gdoc
 * @desc Convert markdown to Google Doc
 * @access Private (API Key required)
 */
router.post('/convert-to-gdoc', validateMarkdownPayload, markdownController.convertMarkdownToGoogleDoc);

/**
 * @route GET /api/markdown/status
 * @desc Check if the markdown API is working
 * @access Public
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Markdown to Google Docs API is working',
    version: '1.0.0'
  });
});

module.exports = router;