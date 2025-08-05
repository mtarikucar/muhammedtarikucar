/**
 * Configuration module
 * Centralizes all environment variables and configuration settings
 */
require('dotenv').config();

// Helper function to validate required environment variables
const validateEnv = (requiredEnvs) => {
  const missing = requiredEnvs.filter(env => !process.env[env]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

// Required environment variables
const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];

// Validate required environment variables
validateEnv(requiredEnvs);

// Configuration object
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') === 'development',
  },
  
  // Database configuration
  db: {
    url: process.env.DATABASE_URL,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'blog_db',
    username: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'password123',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    accessExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  
  // CORS configuration
  cors: {
    allowlist: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "www.muhammedtarikucar.com",
      "muhammedtarikucar.com",
      "https://muhammedtarikucar.com",
      "https://www.muhammedtarikucar.com",
    ],
  },
  
  // Security configuration
  security: {
    bcryptSaltRounds: 12,
    passwordMinLength: 8,
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  },
};

module.exports = config;
