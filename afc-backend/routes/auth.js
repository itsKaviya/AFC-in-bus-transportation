const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signupValidation, signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', protect, getMe);

module.exports = router;
