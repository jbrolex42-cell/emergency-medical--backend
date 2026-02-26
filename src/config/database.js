const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
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
        logger.error('Unable to connect to database:', error);
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
