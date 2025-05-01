/**
 * Main application entry point
 */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import configuration
const config = require('./config');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./utils/logger');
const { logger } = require('./utils/logger');
const { setupSwagger } = require('./utils/swagger');

// Create Express app
const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptionsDelegate = function (req, callback) {
  const corsOptions = {
    origin: config.cors.allowlist.indexOf(req.header('Origin')) !== -1,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  callback(null, corsOptions);
};

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors(corsOptionsDelegate)); // Enable CORS

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Body parsers
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Database connection
mongoose
  .connect(config.db.uri, config.db.options)
  .then(() => logger.info('Connected to database'))
  .catch((err) => {
    logger.error('Database connection error:', err);
    process.exit(1);
  });

// Import routes
const postRoutes = require('./routers/post');
const authRoutes = require('./routers/auth');
const userRoutes = require('./routers/user');
const eventRoutes = require('./routers/event');

// Setup Swagger documentation
setupSwagger(app);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/event', eventRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle 404 routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
server.listen(config.server.port, () => {
  logger.info(
    `Server running in ${config.server.env} mode on port ${config.server.port}`
  );
});
