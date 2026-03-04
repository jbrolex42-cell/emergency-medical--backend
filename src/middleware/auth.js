const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const { User } = require("../models");


const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is restricted"
      });
    }

    req.user = user.toJSON();

    next();

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }

    next(error);
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access requires role: ${roles.join(" | ")}`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};