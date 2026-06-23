const { db } = require('../config');

/**
 * Middleware to fetch and attach user context to request
 * This makes user info available for logging throughout the request lifecycle
 */
const attachUserContext = async (req, res, next) => {
  // If user is already set by auth middleware, fetch full info
  if (req.user && req.user.id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, username, email, role, mobile FROM users WHERE id = ?',
        [req.user.id]
      );
      
      if (rows[0]) {
        // Attach full user info for logging
        req.userContext = {
          id: rows[0].id,
          username: rows[0].username,
          email: rows[0].email,
          role: rows[0].role,
          mobile: rows[0].mobile,
        };
      } else {
        // User not found in DB, use minimal context
        req.userContext = {
          id: req.user.id,
          username: `user_${req.user.id}`,
          role: req.user.role || 'unknown',
        };
      }
    } catch (error) {
      // Fallback if DB query fails
      req.userContext = {
        id: req.user.id,
        username: req.user.username || `user_${req.user.id}`,
        role: req.user.role || 'unknown',
      };
    }
  } else {
    // No user authenticated - anonymous request
    req.userContext = null;
  }
  
  next();
};

module.exports = { attachUserContext };
