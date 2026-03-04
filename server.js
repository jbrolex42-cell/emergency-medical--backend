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


app.use(helmet());
app.use(compression());

app.set("trust proxy", 1);


app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
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



const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use("/api", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Try later."
});

app.use("/api/auth", authLimiter);


app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/providers", providerRoutes);


app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});


app.use(errorHandler);



app.use((req, res) => {
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
      await sequelize.sync({ alter: true });
      console.log("Database synchronized (development mode)");
    } else {
      await sequelize.sync();
    }

    await sequelize.sync({ alter: true });

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