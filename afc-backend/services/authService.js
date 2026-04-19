const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, rfidUID }) => {
  const existing = await User.findOne({ $or: [{ email }, { rfidUID: rfidUID.toUpperCase() }] });
  if (existing) {
    if (existing.email === email) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    throw Object.assign(new Error('RFID UID already registered'), { statusCode: 409 });
  }

  const user = await User.create({ name, email, password, rfidUID: rfidUID.toUpperCase() });
  const token = generateToken(user._id);

  logger.info(`New user registered: ${email}`);
  return { user, token };
};

/**
 * Login user
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

  if (!user.isActive) throw Object.assign(new Error('Account deactivated. Contact support.'), { statusCode: 403 });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  logger.info(`User logged in: ${email}`);
  return { user, token };
};

module.exports = { registerUser, loginUser, generateToken };
