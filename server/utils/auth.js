/**
 * Authentication utilities
 * Provides functions for authentication and authorization
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Validates password strength
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkPasswordStrength = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(AppError.validation('Password is required'));
  }

  // Password strength criteria
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isLongEnough = password.length >= config.security.passwordMinLength;

  const errors = [];
  if (!isLongEnough) errors.push(`Password must be at least ${config.security.passwordMinLength} characters long`);
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumbers) errors.push('Password must contain at least one number');
  if (!hasSymbols) errors.push('Password must contain at least one symbol');

  if (errors.length > 0) {
    return next(AppError.validation('Password does not meet requirements', errors));
  }

  next();
};

/**
 * Hashes a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.security.bcryptSaltRounds);
};

/**
 * Compares a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generates an access token
 * @param {Object} user - User object
 * @returns {string} - JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.accessExpiresIn,
    }
  );
};

/**
 * Generates a refresh token
 * @param {Object} user - User object
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
    }
  );
};

/**
 * Verifies a JWT token
 * @param {string} token - JWT token
 * @param {string} secret - Secret used to sign the token
 * @returns {Object} - Decoded token payload
 * @throws {AppError} - If token is invalid
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Token expired');
    }
    throw AppError.unauthorized('Invalid token');
  }
};

module.exports = {
  checkPasswordStrength,
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};