/**
 * CSRF Protection Middleware
 * Server-side CSRF token generation and validation
 */

const crypto = require('crypto');

// CSRF token storage (in production, use Redis or database)
const tokenStore = new Map();

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
function generateCSRFToken () {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate CSRF token endpoint
 */
function generateCSRFTokenEndpoint (req, res) {
  const token = generateCSRFToken();
  const sessionId = req.sessionID || req.ip; // Use session ID or IP as key
  
  // Store token with expiration (30 minutes)
  tokenStore.set(sessionId, {
    token,
    expires: Date.now() + 30 * 60 * 1000 // 30 minutes
  });
  
  res.json({ csrfToken: token });
}

/**
 * Validate CSRF token
 * @param {string} token - CSRF token to validate
 * @param {string} sessionId - Session ID or IP
 * @returns {boolean} True if valid, false otherwise
 */
function validateCSRFToken (token, sessionId) {
  const storedToken = tokenStore.get(sessionId);
  
  if (!storedToken) {
    return false;
  }
  
  // Check if token is expired
  if (storedToken.expires < Date.now()) {
    tokenStore.delete(sessionId);
    return false;
  }
  
  // Compare tokens using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(storedToken.token),
    Buffer.from(token)
  );
}

/**
 * CSRF Protection Middleware
 * Validates CSRF token for POST, PUT, DELETE requests
 */
function csrfProtection (req, res, next) {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Check for CSRF token in header or body
  const csrfToken = req.headers['x-csrf-token'] || req.body.csrfToken;
  const sessionId = req.sessionID || req.ip;
  
  if (!csrfToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'CSRF token is required for this request'
    });
  }
  
  if (!validateCSRFToken(csrfToken, sessionId)) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'The CSRF token is invalid or has expired'
    });
  }
  
  // Token is valid, proceed with the request
  next();
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens () {
  const now = Date.now();
  
  for (const [sessionId, { expires }] of tokenStore.entries()) {
    if (expires < now) {
      tokenStore.delete(sessionId);
    }
  }
}

// Clean up expired tokens every 15 minutes
setInterval(cleanupExpiredTokens, 15 * 60 * 1000);

module.exports = {
  generateCSRFTokenEndpoint,
  csrfProtection,
  generateCSRFToken,
  validateCSRFToken
};