require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const tripRoutes = require('./routes/trip');
const adminRoutes = require('./routes/admin');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP Logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) }
}));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trip', tripRoutes);
app.use('/api/admin', adminRoutes);

// API Info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Automated Fare Collection System API',
    version: '1.0.0',
    endpoints: {
      auth: [
        'POST /api/auth/signup',
        'POST /api/auth/login',
        'GET  /api/auth/me'
      ],
      wallet: [
        'GET  /api/wallet',
        'POST /api/wallet/recharge'
      ],
      trip: [
        'POST /api/trip/tap-in',
        'POST /api/trip/tap-out',
        'GET  /api/trip/history'
      ],
      admin: [
        'GET  /api/admin/stats',
        'GET  /api/admin/users',
        'GET  /api/admin/transactions',
        'GET  /api/admin/trips'
      ]
    }
  });
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚌 AFC System API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
