const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const FRONTEND_URL = process.env.FRONTEND_URL;

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests",
    message: "Please try again later"
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many authentication attempts",
    message: "Please try again after 15 minutes"
  }
});

const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    error: "Emergency request limit reached",
    message: "Please call emergency services directly if urgent"
  }
});


const securityMiddleware = [
  helmet(),
  cors({
    origin: FRONTEND_URL,
    credentials: true
  }),
  generalLimiter
];

module.exports = {
  securityMiddleware,
  authLimiter,
  emergencyLimiter
};