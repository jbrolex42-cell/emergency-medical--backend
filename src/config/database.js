const { Sequelize } = require('sequelize');
const { DATABASE_URL, NODE_ENV } = require('./env');
const logger = require('../utils/logger');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: NODE_ENV === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
  } catch (error) {
    logger.error('❌ Unable to connect to database:', error);
    throw error;
  }
};

const initializeDatabase = async () => {
  await testConnection();
  
  if (NODE_ENV === 'development') {
    await sequelize.sync({ alter: true });
    logger.info('✅ Database models synchronized');
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};

import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

export default sql