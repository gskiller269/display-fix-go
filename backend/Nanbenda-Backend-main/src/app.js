const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sanitizeMiddleware = require('./middlewares/sanitize.middleware');
const { swaggerUI, specs } = require('./swagger');
const routes = require('./routes');
const { db } = require('./config');

const app = express();

// Enable CORS for all requests
app.use(cors());

// Trust proxy
app.set('trust proxy', 1);

// Simple concise request/response logger for testing
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[RES] ${res.statusCode} ${req.method} ${req.originalUrl} ${ms}ms`);
  });
  next();
});

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const profilesDir = path.join(uploadDir, 'profiles');
const repairsDir = path.join(uploadDir, 'repairs');
const issuesDir = path.join(uploadDir, 'common_issues');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(profilesDir)) fs.mkdirSync(profilesDir, { recursive: true });
if (!fs.existsSync(repairsDir)) fs.mkdirSync(repairsDir, { recursive: true });
if (!fs.existsSync(issuesDir)) fs.mkdirSync(issuesDir, { recursive: true });

app.use(express.json({ limit: '50mb' })); // Increased limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(sanitizeMiddleware);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

// API Routes
app.use('/api', routes);

// Basic health check and DB connection test
app.get('/health', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    res.json({ status: 'OK', database: 'Connected', testResult: rows[0].result });
  } catch (error) {
    res.status(500).json({ status: 'Error', database: 'Disconnected', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

module.exports = app;
