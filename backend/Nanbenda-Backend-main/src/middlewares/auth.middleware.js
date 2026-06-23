const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const ApiResponse = require('../utils/apiResponse');

/**
 * BYPASS AUTHENTICATION FOR DEVELOPMENT
 * If no token is provided, it defaults to User ID 1 (Admin/Customer)
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Default to User ID 1 if no token
    req.user = { id: 1, role: 'admin', mobile: '0000000000' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Even if token is invalid, default to User 1 instead of erroring
      req.user = { id: 1, role: 'admin', mobile: '0000000000' };
      return next();
    }
    req.user = user;
    next();
  });
};

/**
 * BYPASS AUTHORIZATION FOR DEVELOPMENT
 * Always allows access
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    // Always allow
    if (!req.user) {
      req.user = { id: 1, role: 'admin', mobile: '0000000000' };
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorize
};
