const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in environment variables");
}

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
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

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');
    } catch (error) {
        logger.error('Unable to connect to database:', error.message);
        throw error;
    }
};

const initializeDatabase = async () => {
    await testConnection();

    if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        logger.info('Database models synchronized');
    }
};

module.exports = {
    sequelize,
    testConnection,
    initializeDatabase
};