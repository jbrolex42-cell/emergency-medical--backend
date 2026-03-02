const { Sequelize } = require("sequelize");
require("dotenv").config();
const logger = require("../utils/logger");

let sequelize;



if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {

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
            acquire: 30000,
            idle: 10000
        }
    });

} else {

    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: "postgres",
            logging: false
        }
    );
}

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info("Database connection successful");
    } catch (error) {
        logger.error("Database connection failed:", error.message);
        throw error;
    }
};

module.exports = {
    sequelize,
    testConnection
};