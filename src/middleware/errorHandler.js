const { NODE_ENV } = require('../config/env');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {

  if (!err) return next();

  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req?.path,
    method: req?.method,
    timestamp: new Date().toISOString()
  });

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File too large",
      message: "Maximum file size is 5MB"
    });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors?.map(e => e.message) || []
    });
  }


  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Duplicate Entry",
      message: "Resource already exists"
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  return res.status(500).json({
    error: "Internal server error",
    ...(NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = errorHandler;