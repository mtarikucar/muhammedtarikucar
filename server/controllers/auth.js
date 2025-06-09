/**
 * Authentication controller
 * Handles user registration, login, and token refresh
 */
const User = require('../models/User.model');
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken
} = require('../utils/auth');
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return next(AppError.validation('Username, email, and password are required'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return next(AppError.duplicateEntry('User with this email already exists'));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({
      name: username, // Map username to name field for MongoDB validation
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'member', // Explicitly set default role
      isActive: true, // Explicitly set default active status
      gender: 'not selected' // Explicitly set default gender
    });

    // Save user to database
    await user.save();

    // Create a sanitized user object without password
    const userResponse = user.toObject();
    delete userResponse.password;

    // Return success response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: userResponse,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
}

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return next(AppError.validation('Email and password are required'));
    }

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    // Check if user exists
    if (!user) {
      return next(AppError.notFound('User not found'));
    }

    // Check if password is correct
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(AppError.unauthorized('Invalid credentials'));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create a sanitized user object without password
    const userResponse = user.toObject();
    delete userResponse.password;

    // Return success response
    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
}

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    // Validate required fields
    if (!refreshToken) {
      return next(AppError.validation('Refresh token is required'));
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken, config.jwt.refreshSecret);

    // Find user by id
    const user = await User.findById(payload.id);

    // Check if user exists
    if (!user || !user.isActive) {
      return next(AppError.unauthorized('Invalid refresh token'));
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    // Return success response
    res.status(200).json({
      status: 'success',
      accessToken,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh
};
