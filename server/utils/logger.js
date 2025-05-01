/**
 * Logger module
 * Provides a centralized logging mechanism for the application
 */
const winston = require('winston');
const config = require('../config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create console transport
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(
      ({ level, message, timestamp, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      }
    )
  ),
});

// Create file transports for production
const fileTransports = config.server.isDev ? [] : [
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'api-service' },
  transports: [
    consoleTransport,
    ...fileTransports,
  ],
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

// Create request logger middleware
const requestLogger = (req, res, next) => {
  const startTime = new Date();
  
  // Log when the request completes
  res.on('finish', () => {
    const duration = new Date() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel]({
      message: `${req.method} ${req.originalUrl}`,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger,
};
