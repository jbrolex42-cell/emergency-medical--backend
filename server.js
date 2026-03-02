require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cors = require("cors");

const { sequelize, testConnection } = require("./src/config/database");

const authRoutes = require("./src/routes/auth");
const subscriptionRoutes = require("./src/routes/subscriptions");
const emergencyRoutes = require("./src/routes/emergencies");
const providerRoutes = require("./src/routes/providers");

const app = express();

/*
--------------------------------------------------
 SECURITY + PERFORMANCE MIDDLEWARE
--------------------------------------------------
*/

app.use(helmet());
app.use(compression());

app.set("trust proxy", 1);

/*
--------------------------------------------------
 CORS CONFIGURATION (CLEAN VERSION)
--------------------------------------------------
*/

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/*
--------------------------------------------------
 BODY PARSING
--------------------------------------------------
*/

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

/*
--------------------------------------------------
 LOGGING
--------------------------------------------------
*/

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

/*
--------------------------------------------------
 RATE LIMITING
--------------------------------------------------
*/

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use("/api/", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Try later."
});

app.use("/api/auth", authLimiter);

/*
--------------------------------------------------
 API ROUTES (IMPORTANT ORDER)
--------------------------------------------------
*/

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/providers", providerRoutes);

/*
--------------------------------------------------
 HEALTH CHECK ROUTES
--------------------------------------------------
*/

app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

/*
--------------------------------------------------
 ERROR HANDLER (VERY IMPORTANT)
--------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("Backend Error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

/*
--------------------------------------------------
 404 HANDLER
--------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/*
--------------------------------------------------
 SERVER STARTUP
--------------------------------------------------
*/

const PORT = process.env.PORT || 10000;

const startServer = async () => {
  try {
    await testConnection();
    console.log("Database connected");

    await sequelize.sync();

    console.log("Database connected");
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

/*
--------------------------------------------------
 DATABASE HEARTBEAT
--------------------------------------------------
*/

setInterval(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB heartbeat OK");
  } catch (err) {
    console.error("DB reconnecting...", err.message);
  }
}, 60000);

startServer();