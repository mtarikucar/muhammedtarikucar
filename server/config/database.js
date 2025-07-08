const { Sequelize } = require('sequelize');
const config = require('./index');
const { logger } = require('../utils/logger');

// Create Sequelize instance
const sequelize = new Sequelize(config.db.url || {
  database: config.db.database,
  username: config.db.username,
  password: config.db.password,
  host: config.db.host,
  port: config.db.port,
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
    await sequelize.sync({ force });
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
