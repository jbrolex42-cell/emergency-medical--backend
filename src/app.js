const express = require('express');
const securityMiddleware = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');
const path = require('path');
const app = express();

// Security middleware
app.use(securityMiddleware);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check with EMS-specific metrics
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Kenya EMS Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      shaIntegration: !!process.env.SHA_API_KEY,
      what3words: !!process.env.WHAT3WORDS_API_KEY,
      offlineMode: true
    }
  });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

console.log(app._router.stack.filter(r=>r.route).map(r=>r.route.path));

module.exports = app;