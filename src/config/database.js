const { Sequelize } = require("sequelize");
require("dotenv").config();
const logger = require("../utils/logger");

let sequelize;

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && process.env.DATABASE_URL) {

    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",

        logging: false,

        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },

        pool: {
            max: 5,
            min: 0,
            acquire: 60000,
            idle: 20000
        },

        retry: {
            match: [
                /ETIMEDOUT/,
                /ECONNRESET/,
                /ECONNREFUSED/,
                /SequelizeConnectionError/
            ],
            max: 5
        }
    });

} else {

    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 5432,
            dialect: "postgres",

            logging: false,

            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info("Database connection established successfully");
    } catch (error) {
        logger.error("Database connection failed:", error.message);
        throw error;
    }
};

module.exports = {
    sequelize,
    testConnection
};