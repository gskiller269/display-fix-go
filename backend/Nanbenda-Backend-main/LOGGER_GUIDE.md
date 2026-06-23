# Nanbenda Backend Logger

## Overview
The backend now features **color-coded user identification logging** that shows the user ID and username in every log message with a unique, vibrant color assigned to each user.

## Features

### 🎨 Dynamic User Colors
- **18 unique colors** available for user identification
- Colors are assigned **deterministically** based on user ID (same user always gets the same color)
- Colors are distributed evenly across the spectrum for visual distinction

### 📝 Log Format
Every log message includes:
```
ℹ [CONTEXT] 👤 username #userId message
```

Example output:
```
ℹ [HTTP] 👤 admin #1 GET /api/products
✔ [HTTP] 👤 admin #1 200 GET /api/products 42ms
⚠ [AUTH] 👤 john_doe #5 Failed login attempt
✖ [ASSISTANT] 👤 jane_smith #3 Error parsing device_ids
```

### 🎯 Color Badges
Each user gets a colored badge with:
- **Background color**: Unique to each user
- **Username**: Display name from database
- **User ID**: Numeric identifier

## Usage

### In Services
```javascript
const { logSync } = require('../utils/logger');

// Basic usage with user context
logSync('Your message here', userInfo, { 
  context: 'SERVICE_NAME',
  level: 'info'  // info, warn, error, success, debug
});

// Example in a controller/service
async function updateUser(userId, data) {
  logSync(`Updating user profile`, req.userContext, { context: 'USER' });
  // ... update logic
  logSync(`User profile updated successfully`, req.userContext, { 
    level: 'success', 
    context: 'USER' 
  });
}
```

### Log Levels
- **info** (ℹ cyan) - General information
- **warn** (⚠ yellow) - Warnings
- **error** (✖ red) - Errors
- **success** (✔ green) - Success messages
- **debug** (⚙ purple) - Debug info (only in development)

### Without User Context
For system-level logs without user context:
```javascript
logSync('Server starting', null, { context: 'SYSTEM', level: 'success' });
```

## Available Colors

The system uses 18 distinct colors:
1. Cyan
2. Magenta
3. Green
4. Yellow
5. Blue
6. Red
7. White
8. Bright Cyan
9. Bright Magenta
10. Bright Green
11. Bright Yellow
12. Bright Blue
13. Bright Red
14. Orange
15. Pink
16. Lime
17. Teal
18. Lavender

## Architecture

### Files
- `src/utils/logger.js` - Logger utility with color definitions
- `src/middlewares/userContext.middleware.js` - Attaches user info to requests
- `src/app.js` - Enhanced request/response logging

### Flow
1. Request comes in
2. `attachUserContext` middleware fetches user info from DB
3. Request logger uses `userContext` to display colored badge
4. Services can use `logSync` with `req.userContext` for consistent logging

## Benefits

✅ **Easy debugging** - Instantly see which user triggered an action
✅ **Visual tracking** - Follow user sessions by color
✅ **Non-intrusive** - Colors don't affect log parsing
✅ **Production ready** - ANSI codes work in terminals, strip in files
✅ **Consistent format** - All logs follow the same pattern

## Notes

- Colors use ANSI escape codes (works in most terminals)
- In production logs to files, ANSI codes will be present (can be stripped if needed)
- User info is fetched once per request and cached in `req.userContext`
- The color assignment is deterministic - same user ID always gets the same color
