/**
 * Monitoring utilities
 */
const { logger } = require('./logger');

/**
 * Performance monitoring middleware
 */
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn({
        message: 'Slow request detected',
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
};

/**
 * Memory usage monitor
 */
const memoryMonitor = () => {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memoryInfo = {
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`
    };
    
    // Log if heap usage is high
    if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
      logger.warn({
        message: 'High memory usage detected',
        memory: memoryInfo
      });
    }
  }, 60000); // Check every minute
};

/**
 * Database connection monitor
 */
const databaseMonitor = (sequelize) => {
  setInterval(async () => {
    try {
      await sequelize.authenticate();
    } catch (error) {
      logger.error({
        message: 'Database connection lost',
        error: error.message
      });
    }
  }, 30000); // Check every 30 seconds
};

/**
 * Application metrics
 */
class Metrics {
  constructor() {
    this.requests = {
      total: 0,
      success: 0,
      error: 0,
      byEndpoint: {},
      byMethod: {}
    };
    this.startTime = Date.now();
  }
  
  recordRequest(req, res) {
    this.requests.total++;
    
    if (res.statusCode < 400) {
      this.requests.success++;
    } else {
      this.requests.error++;
    }
    
    // Track by endpoint
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    this.requests.byEndpoint[endpoint] = (this.requests.byEndpoint[endpoint] || 0) + 1;
    
    // Track by method
    this.requests.byMethod[req.method] = (this.requests.byMethod[req.method] || 0) + 1;
  }
  
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    return {
      uptime: `${Math.floor(uptime / 1000 / 60)} minutes`,
      requests: this.requests,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }
}

const metrics = new Metrics();

/**
 * Metrics collection middleware
 */
const collectMetrics = (req, res, next) => {
  res.on('finish', () => {
    metrics.recordRequest(req, res);
  });
  next();
};

module.exports = {
  performanceMonitor,
  memoryMonitor,
  databaseMonitor,
  collectMetrics,
  metrics
};