const express = require('express');
const router = express.Router();
const { getUsers, getTransactions, getTrips, getStats, toggleUserStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Admin
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users', getUsers);

/**
 * @route   PATCH /api/admin/users/:id/toggle
 * @desc    Toggle user active status
 * @access  Admin
 */
router.patch('/users/:id/toggle', toggleUserStatus);

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions
 * @access  Admin
 */
router.get('/transactions', getTransactions);

/**
 * @route   GET /api/admin/trips
 * @desc    Get all trips
 * @access  Admin
 */
router.get('/trips', getTrips);

module.exports = router;
