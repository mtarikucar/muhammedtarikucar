/**
 * Central error handling middleware
 * Standardizes error responses across the application
 */

// Error types
const ErrorTypes = {
  VALIDATION_ERROR: 'ValidationError',
  UNAUTHORIZED: 'UnauthorizedError',
  FORBIDDEN: 'ForbiddenError',
  NOT_FOUND: 'NotFoundError',
  INTERNAL_SERVER: 'InternalServerError',
  DUPLICATE_ENTRY: 'DuplicateEntryError',
};

// Custom error class
class AppError extends Error {
  constructor(message, type, statusCode, details = null) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static validation(message, details = null) {
    return new AppError(message, ErrorTypes.VALIDATION_ERROR, 400, details);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new AppError(message, ErrorTypes.UNAUTHORIZED, 401);
  }

  static forbidden(message = 'Forbidden access') {
    return new AppError(message, ErrorTypes.FORBIDDEN, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, ErrorTypes.NOT_FOUND, 404);
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, ErrorTypes.INTERNAL_SERVER, 500);
  }

  static duplicateEntry(message = 'Duplicate entry', details = null) {
    return new AppError(message, ErrorTypes.DUPLICATE_ENTRY, 409, details);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let errorType = err.type || ErrorTypes.INTERNAL_SERVER;
  let message = err.message || 'Something went wrong';
  let details = err.details || null;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = ErrorTypes.VALIDATION_ERROR;
    message = 'Document failed validation';
    details = Object.values(err.errors).map(val => val.message);
  }

  // Handle MongoDB document validation errors
  if (err.name === 'MongoServerError' && err.code === 121) {
    statusCode = 400;
    errorType = ErrorTypes.VALIDATION_ERROR;
    message = 'Document failed validation';
    details = err.errInfo?.details || null;
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    errorType = ErrorTypes.DUPLICATE_ENTRY;
    message = 'Duplicate entry';
    details = err.keyValue;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = ErrorTypes.UNAUTHORIZED;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = ErrorTypes.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Send standardized error response
  res.status(statusCode).json({
    status: 'error',
    type: errorType,
    message,
    details: details,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler middleware
const notFoundHandler = (req, res, next) => {
  const error = AppError.notFound(`Route not found: ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
  ErrorTypes,
};
