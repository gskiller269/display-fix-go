const validator = require('validator');

/**
 * Recursively sanitizes strings in an object/array using validator.escape()
 */
const sanitize = (data) => {
  if (typeof data === 'string') {
    return validator.escape(data.trim());
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitizedData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedData[key] = sanitize(data[key]);
      }
    }
    return sanitizedData;
  }
  
  return data;
};

/**
 * Middleware to sanitize req.body, req.query, and req.params
 * In Express 5, these are getters, so we modify the properties within them
 * rather than overwriting the entire object.
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    const sanitizedBody = sanitize(req.body);
    // Overwrite properties in req.body
    Object.keys(sanitizedBody).forEach(key => {
      req.body[key] = sanitizedBody[key];
    });
  }
  
  if (req.query && typeof req.query === 'object' && !Array.isArray(req.query)) {
    const sanitizedQuery = sanitize(req.query);
    // Overwrite properties in req.query
    Object.keys(sanitizedQuery).forEach(key => {
      req.query[key] = sanitizedQuery[key];
    });
  }
  
  if (req.params && typeof req.params === 'object' && !Array.isArray(req.params)) {
    const sanitizedParams = sanitize(req.params);
    // Overwrite properties in req.params
    Object.keys(sanitizedParams).forEach(key => {
      req.params[key] = sanitizedParams[key];
    });
  }
  
  next();
};

module.exports = sanitizeMiddleware;
