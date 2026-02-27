require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { sequelize, testConnection } = require('./src/config/database');

const authRoutes = require('./src/routes/auth');
const subscriptionRoutes = require('./src/routes/subscriptions');
const emergencyRoutes = require('./src/routes/emergencies');
const providerRoutes = require('./src/routes/providers');

const app = express();

app.use(helmet());

app.use(cors({
    origin: "https://emergency-frontend-sepia.vercel.app",
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"],
    exposedHeaders: ["Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://emergency-frontend-sepia.vercel.app");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});


app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

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

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);


app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send("Backend is running successfully");
});

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/providers", providerRoutes);


app.use((err, req, res, next) => {
    console.error("Backend Error:", err);

    res.status(500).json({
        error: "Server error",
        message: err.message
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});


const PORT = process.env.PORT || 10000;

const startServer = async () => {
    try {
        await testConnection();

        if (process.env.NODE_ENV === "development") {
            await sequelize.sync();
            console.log("Database synced");
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();