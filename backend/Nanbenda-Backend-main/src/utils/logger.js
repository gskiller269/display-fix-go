// ANSI color codes
const RESET = '\x1b[0m';
const BRIGHT = '\x1b[1m';
const DIM = '\x1b[2m';

// Predefined vibrant colors for user identification
const USER_COLORS = [
  { name: 'cyan', fg: '\x1b[36m', badge: '\x1b[36m' },
  { name: 'magenta', fg: '\x1b[35m', badge: '\x1b[35m' },
  { name: 'green', fg: '\x1b[32m', badge: '\x1b[32m' },
  { name: 'yellow', fg: '\x1b[33m', badge: '\x1b[33m' },
  { name: 'blue', fg: '\x1b[34m', badge: '\x1b[34m' },
  { name: 'red', fg: '\x1b[31m', badge: '\x1b[31m' },
  { name: 'white', fg: '\x1b[37m', badge: '\x1b[37m' },
  { name: 'brightCyan', fg: '\x1b[96m', badge: '\x1b[96m' },
  { name: 'brightMagenta', fg: '\x1b[95m', badge: '\x1b[95m' },
  { name: 'brightGreen', fg: '\x1b[92m', badge: '\x1b[92m' },
  { name: 'brightYellow', fg: '\x1b[93m', badge: '\x1b[93m' },
  { name: 'brightBlue', fg: '\x1b[94m', badge: '\x1b[94m' },
  { name: 'brightRed', fg: '\x1b[91m', badge: '\x1b[91m' },
  { name: 'orange', fg: '\x1b[38;5;208m', badge: '\x1b[38;5;208m' },
  { name: 'pink', fg: '\x1b[38;5;205m', badge: '\x1b[38;5;205m' },
  { name: 'lime', fg: '\x1b[38;5;118m', badge: '\x1b[38;5;118m' },
  { name: 'teal', fg: '\x1b[38;5;37m', badge: '\x1b[38;5;37m' },
  { name: 'lavender', fg: '\x1b[38;5;147m', badge: '\x1b[38;5;147m' },
];

// Cache for user colors (userId -> color)
const userColorCache = new Map();

/**
 * Get a deterministic but visually distinct color for a user
 */
function getUserColor(userId) {
  if (userColorCache.has(userId)) {
    return userColorCache.get(userId);
  }

  const hash = String(userId).split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const colorIndex = Math.abs(hash) % USER_COLORS.length;
  const color = USER_COLORS[colorIndex];
  
  userColorCache.set(userId, color);
  return color;
}

/**
 * Fetch user info from database (lazy load db to avoid circular dependency)
 */
async function getUserInfo(userId) {
  if (!userId) return null;
  
  try {
    const { db } = require('../config');
    const [rows] = await db.execute(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [userId]
    );
    return rows[0] || null;
  } catch (error) {
    return { id: userId, username: `user_${userId}`, role: 'unknown' };
  }
}

/**
 * Format user tag with color
 */
function formatUserTag(userId, username) {
  const color = getUserColor(userId);
  const displayName = username || `user_${userId}`;
  
  return `${color.badge}${BRIGHT}[👤 ${displayName} #${userId}]${RESET}`;
}

/**
 * Main logger function
 */
async function log(message, userId = null, options = {}) {
  const { level = 'info', context = '' } = options;
  
  let prefix = '';
  
  const levelIcons = {
    info: `${DIM}\x1b[36mℹ${RESET}`,
    warn: `${BRIGHT}\x1b[33m⚠${RESET}`,
    error: `${BRIGHT}\x1b[31m✖${RESET}`,
    success: `${BRIGHT}\x1b[32m✔${RESET}`,
    debug: `${DIM}\x1b[35m⚙${RESET}`,
  };
  
  prefix += levelIcons[level] || levelIcons.info;
  
  if (context) {
    prefix += ` ${DIM}[${context}]${RESET}`;
  }
  
  if (userId) {
    const userInfo = await getUserInfo(userId);
    const username = userInfo?.username;
    prefix += ` ${formatUserTag(userId, username)}`;
  }
  
  console.log(`${prefix} ${message}${RESET}`);
}

/**
 * Synchronous version when user info is already available
 */
function logSync(message, userInfo, options = {}) {
  const { level = 'info', context = '' } = options;
  
  let prefix = '';
  
  const levelIcons = {
    info: `${DIM}\x1b[36mℹ${RESET}`,
    warn: `${BRIGHT}\x1b[33m⚠${RESET}`,
    error: `${BRIGHT}\x1b[31m✖${RESET}`,
    success: `${BRIGHT}\x1b[32m✔${RESET}`,
    debug: `${DIM}\x1b[35m⚙${RESET}`,
  };
  
  prefix += levelIcons[level] || levelIcons.info;
  
  if (context) {
    prefix += ` ${DIM}[${context}]${RESET}`;
  }
  
  if (userInfo?.id) {
    prefix += ` ${formatUserTag(userInfo.id, userInfo.username)}`;
  }
  
  console.log(`${prefix} ${message}${RESET}`);
}

function error(message, userId = null, context = '') {
  log(message, userId, { level: 'error', context });
}

function warn(message, userId = null, context = '') {
  log(message, userId, { level: 'warn', context });
}

function success(message, userId = null, context = '') {
  log(message, userId, { level: 'success', context });
}

function debug(message, userId = null, context = '') {
  if (process.env.NODE_ENV !== 'production') {
    log(message, userId, { level: 'debug', context });
  }
}

module.exports = {
  log,
  logSync,
  error,
  warn,
  success,
  debug,
  getUserColor,
  formatUserTag,
  getUserInfo,
  USER_COLORS,
};
