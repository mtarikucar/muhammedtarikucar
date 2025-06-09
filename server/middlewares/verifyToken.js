/**
 * Authentication middleware
 * Provides middleware functions for token verification and authorization
 */
const { verifyToken } = require('../utils/auth');
const config = require('../config');
const { AppError } = require('./errorHandler');
const { logger } = require('../utils/logger');

/**
 * Verifies JWT token from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(AppError.unauthorized('Authorization header is required'));
    }

    // Check if authorization header has correct format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(AppError.unauthorized('Authorization header must be in format: Bearer [token]'));
    }

    const token = parts[1];

    // Verify token
    const payload = verifyToken(token, config.jwt.secret);

    // Set user in request object
    req.user = payload;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(error);
  }
};

/**
 * Verifies if user is authorized to access resource
 * User must be the owner of the resource or be authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authorizeUser = (req, res, next) => {
  try {
    // First authenticate the user
    authenticate(req, res, (err) => {
      if (err) return next(err);

      // Check if user is authorized (owner of resource or just authenticated)
      const isOwner = req.params.id && req.user.id === req.params.id;
      const isAuthenticated = req.user && req.user.id;

      if (isOwner || isAuthenticated) {
        return next();
      }

      return next(AppError.forbidden('You are not authorized to perform this action'));
    });
  } catch (error) {
    logger.error('Authorization error:', error);
    next(error);
  }
};

/**
 * Verifies if user owns the resource (strict ownership check)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authorizeOwner = (req, res, next) => {
  try {
    // First authenticate the user
    authenticate(req, res, (err) => {
      if (err) return next(err);

      // Check if user is the owner of the resource
      const isOwner = req.params.id && req.user.id === req.params.id;

      if (isOwner) {
        return next();
      }

      return next(AppError.forbidden('You can only access your own resources'));
    });
  } catch (error) {
    logger.error('Owner authorization error:', error);
    next(error);
  }
};

/**
 * Verifies if user is an admin
 * User must be the owner of the resource or have admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authorizeAdmin = (req, res, next) => {
  try {
    // First authenticate the user
    authenticate(req, res, (err) => {
      if (err) return next(err);

      // Check if user is authorized
      const isOwner = req.params.id && req.user.id === req.params.id;
      const isAdmin = req.user.role === 'admin';

      if (isOwner || isAdmin) {
        return next();
      }

      return next(AppError.forbidden('Admin access required'));
    });
  } catch (error) {
    logger.error('Admin authorization error:', error);
    next(error);
  }
};

/**
 * Verifies if user is an admin (strict admin check)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireAdmin = (req, res, next) => {
  try {
    // First authenticate the user
    authenticate(req, res, (err) => {
      if (err) return next(err);

      // Check if user is admin
      if (req.user.role !== 'admin') {
        return next(AppError.forbidden('Admin access required'));
      }

      next();
    });
  } catch (error) {
    logger.error('Admin requirement error:', error);
    next(error);
  }
};

module.exports = {
  verifyToken: authenticate,
  verifyTokenAndAuth: authorizeUser,
  verifyTokenAndOwner: authorizeOwner,
  verifyTokenAndAdmin: requireAdmin,
  verifyIsAdmin: authorizeAdmin,
  authenticate
};
