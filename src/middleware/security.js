const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { FRONTEND_URL } = require('../config/env');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict auth rate limiter (KMPDC compliance for security)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again after 15 minutes'
  }
});

// Emergency request limiter (higher limit for emergencies)
const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Max 3 emergency calls per minute per IP
  message: {
    error: 'Emergency request limit reached',
    message: 'Please call 999/112 directly if immediate assistance needed'
  }
});

const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.what3words.com", "https://api.sha.go.ke"],
        imgSrc: ["'self'", "data:", "https://assets.what3words.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"]
      }
    }
  }),
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }),
  generalLimiter
];

module.exports = securityMiddleware;
module.exports.authLimiter = authLimiter;
module.exports.emergencyLimiter = emergencyLimiter;