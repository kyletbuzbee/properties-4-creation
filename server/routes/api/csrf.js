/**
 * CSRF Token API Routes
 * Endpoints for CSRF token generation and management
 */

const express = require('express');
const router = express.Router();
const { generateCSRFTokenEndpoint } = require('../../middleware/csrf');

// @route   GET api/csrf
// @desc    Generate CSRF token
// @access  Public
router.get('/', generateCSRFTokenEndpoint);

module.exports = router;