/**
 * CSP Reporting Endpoint
 * Receives Content Security Policy violation reports
 */

const express = require('express');
const router = express.Router();

// @route   POST api/csp
// @desc    Receive CSP violation reports
// @access  Public
router.post('/', (req, res) => {
  try {
    // Log CSP violation report
    const cspReport = req.body;
    
    // In production, you would:
    // 1. Store the report in a database
    // 2. Send alerts to security team
    // 3. Analyze patterns for security improvements
    
    // For now, just log to console (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('CSP Violation Report:', JSON.stringify(cspReport, null, 2));
    }
    
    // Respond with 204 No Content as per CSP spec
    res.status(204).end();
  } catch (error) {
    // Silent error handling for security
    res.status(204).end();
  }
});

module.exports = router;