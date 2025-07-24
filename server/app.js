/**
 * Main application entry point
 */
const express = require('express');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import configuration
const config = require('./config');

// Import models to initialize associations
require('./models');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./utils/logger');
const { logger } = require('./utils/logger');
const { setupSwagger } = require('./utils/swagger');
const socketHandler = require('./utils/socketHandler');
const { preventParameterPollution, sanitizeInput, checkSecurityHeaders } = require('./middlewares/security');
const { performanceMonitor, memoryMonitor, databaseMonitor, collectMetrics, metrics } = require('./utils/monitoring');

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: config.cors.allowlist,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup socket handlers
socketHandler(io);

// CORS configuration
const corsOptionsDelegate = function (req, callback) {
  const origin = req.header('Origin');
  const isAllowed = !origin || config.cors.allowlist.includes(origin);

  const corsOptions = {
    origin: isAllowed,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  callback(null, corsOptions);
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
})); // Set security HTTP headers
app.use(cors(corsOptionsDelegate)); // Enable CORS
app.use(checkSecurityHeaders); // Additional security headers
app.use(preventParameterPollution); // Prevent parameter pollution
app.use(sanitizeInput); // Sanitize input data

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

// Request logging and monitoring
app.use(requestLogger);
app.use(performanceMonitor);
app.use(collectMetrics);

// Database connection
const { testConnection, syncDatabase } = require('./config/database');

// Initialize database
const initializeDatabase = async () => {
  try {
    await testConnection();
    await syncDatabase(false); // Set to true to force recreate tables
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
    process.exit(1);
  }
};

initializeDatabase().then(() => {
  // Start monitoring
  memoryMonitor();
  databaseMonitor(require('./config/database').sequelize);
});

// Import routes
const postRoutes = require('./routers/post');
const authRoutes = require('./routers/auth');
const userRoutes = require('./routers/user');
const analyticsRoutes = require('./routers/analytics');
const newsletterRoutes = require('./routers/newsletter');
const categoryRoutes = require('./routers/category');
const searchRoutes = require('./routers/search');
const commentRoutes = require('./routers/comment');
const messageRoutes = require('./routers/message');
const roomRoutes = require('./routers/room');
const communityRoutes = require('./routers/community');
const eventRoutes = require('./routers/event');
const uploadRoutes = require('./routers/upload');
const chatRoutes = require('./routers/chat');

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Metrics endpoint (protected in production)
app.get('/api/metrics', (req, res) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-metrics-key'] !== process.env.METRICS_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(metrics.getMetrics());
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

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
