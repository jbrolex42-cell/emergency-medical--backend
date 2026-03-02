const apiResponse = {

  success: (res, data, statusCode = 200) => {

    if (!res || typeof res.status !== "function") {
      throw new Error("Invalid response object");
    }

    res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  },

  error: (res, message, statusCode = 500, details = null) => {

    if (!res || typeof res.status !== "function") {
      throw new Error("Invalid response object");
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString()
    });
  }

};

module.exports = apiResponse;