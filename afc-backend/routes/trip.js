const express = require('express');
const router = express.Router();
const { handleTapIn, handleTapOut, history } = require('../controllers/tripController');
const { tapInValidation, tapOutValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @route   POST /api/trip/tap-in
 * @desc    Tap in to start a trip
 * @access  Private
 */
router.post('/tap-in', tapInValidation, handleTapIn);

/**
 * @route   POST /api/trip/tap-out
 * @desc    Tap out to end a trip and calculate fare
 * @access  Private
 */
router.post('/tap-out', tapOutValidation, handleTapOut);

/**
 * @route   GET /api/trip/history
 * @desc    Get trip history for logged-in user
 * @access  Private
 */
router.get('/history', history);

module.exports = router;
