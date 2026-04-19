const express = require('express');
const router = express.Router();
const { getBalance, recharge } = require('../controllers/walletController');
const { rechargeValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @route   GET /api/wallet
 * @desc    Get wallet balance and recent transactions
 * @access  Private
 */
router.get('/', getBalance);

/**
 * @route   POST /api/wallet/recharge
 * @desc    Recharge wallet
 * @access  Private
 */
router.post('/recharge', rechargeValidation, recharge);

module.exports = router;
