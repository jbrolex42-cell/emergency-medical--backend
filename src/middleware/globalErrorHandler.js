const globalErrorHandler = (err, req, res, next) => {
  console.error("Server Error:", err);

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

module.exports = globalErrorHandler;