require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const { sequelize } = require("./src/config/database");

const authRoutes = require("./src/routes/auth");
const subscriptionRoutes = require("./src/routes/subscriptions");
const emergencyRoutes = require("./src/routes/emergencies");
const providerRoutes = require("./src/routes/providers");

const errorHandler = require("./src/middleware/errorHandler");

const app = express();

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(helmet());
app.use(compression());
app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);



app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));



app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);



app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
}));



app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/providers", providerRoutes);


app.get("/", (_, res) => {
  res.send("Backend is running");
});

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});


app.use(errorHandler);


app.use((_, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});


const PORT = process.env.PORT || 10000;

const startServer = async () => {
  try {

    await sequelize.authenticate();
    console.log("Database connected");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: false });
      console.log("Database synchronized (dev)");
    } else {
      await sequelize.sync();
    }

    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();