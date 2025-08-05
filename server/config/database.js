const { Sequelize } = require('sequelize');
const config = require('./index');
const { logger } = require('../utils/logger');

// Create Sequelize instance - strict configuration
if (!config.db.url) {
  throw new Error('DATABASE_URL is required');
}

const sequelize = new Sequelize(config.db.url, {
  dialect: config.db.dialect,
  logging: config.db.logging,
  pool: config.db.pool,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: false,
  },
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Sync database
const syncDatabase = async (force = false) => {
  try {
    // Use alter only in development, skip if tables exist
    await sequelize.sync({ force, alter: false });
    logger.info(`Database synchronized ${force ? '(forced)' : ''}`);
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  Sequelize
};
