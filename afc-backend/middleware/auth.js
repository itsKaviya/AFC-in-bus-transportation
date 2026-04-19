const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'Token is invalid. User not found.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account is deactivated. Contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please login again.');
    }
    return sendError(res, 500, 'Authentication failed.');
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }
  next();
};

module.exports = { protect, adminOnly };
