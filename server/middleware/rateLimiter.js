/**
 * Rate Limiting Middleware
 * Prevents abuse and brute force attacks on API endpoints
 */

// Rate limit storage (in production, use Redis or database)
const rateLimitStore = new Map();

/**
 * Rate Limiter Middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} timeWindow - Time window in minutes
 * @returns {Function} Express middleware
 */
function rateLimiter (maxRequests = 5, timeWindow = 1) {
  const windowMs = timeWindow * 60 * 1000; // Convert minutes to milliseconds

  return function (req, res, next) {
    const clientId = req.ip; // Use client IP as identifier
    const now = Date.now();
    
    // Initialize client record if it doesn't exist
    if (!rateLimitStore.has(clientId)) {
      rateLimitStore.set(clientId, {
        requests: [now],
        lastReset: now
      });
      return next();
    }
    
    const clientData = rateLimitStore.get(clientId);
    
    // Reset request count if time window has passed
    if (now - clientData.lastReset > windowMs) {
      clientData.requests = [now];
      clientData.lastReset = now;
      return next();
    }
    
    // Add current request
    clientData.requests.push(now);
    
    // Check if rate limit exceeded
    if (clientData.requests.length > maxRequests) {
      const retryAfter = Math.ceil((windowMs - (now - clientData.lastReset)) / 1000);
      
      res.set('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: 'Too many requests',
        message: `You have exceeded the ${maxRequests} requests per ${timeWindow} minute limit`,
        retryAfter: retryAfter
      });
    }
    
    // Request allowed
    next();
  };
}

/**
 * Clean up expired rate limit records
 */
function cleanupRateLimitStore () {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  for (const [clientId, { lastReset }] of rateLimitStore.entries()) {
    if (lastReset < oneHourAgo) {
      rateLimitStore.delete(clientId);
    }
  }
}

// Clean up expired records every 15 minutes
setInterval(cleanupRateLimitStore, 15 * 60 * 1000);

module.exports = rateLimiter;