const { registerUser, loginUser } = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

const signup = async (req, res, next) => {
  try {
    const { name, email, password, rfidUID } = req.body;
    const { user, token } = await registerUser({ name, email, password, rfidUID });
    return sendSuccess(res, 201, 'Account created successfully', { user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser({ email, password });
    return sendSuccess(res, 200, 'Login successful', { user, token });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'User profile', { user: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };
