/**
 * Additional security middleware
 */
const { AppError } = require('./errorHandler');

/**
 * Prevent parameter pollution
 */
const preventParameterPollution = (req, res, next) => {
  // Convert arrays in query params to last value
  Object.keys(req.query).forEach(key => {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][req.query[key].length - 1];
    }
  });
  next();
};

/**
 * Sanitize request data
 */
const sanitizeInput = (req, res, next) => {
  // Basic XSS prevention for string inputs
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove script tags and other potentially harmful content
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

/**
 * Check for common security headers
 */
const checkSecurityHeaders = (req, res, next) => {
  // Add additional security headers not covered by helmet
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

module.exports = {
  preventParameterPollution,
  sanitizeInput,
  checkSecurityHeaders
};