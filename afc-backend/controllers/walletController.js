const { getWallet, rechargeWallet } = require('../services/walletService');
const { sendSuccess } = require('../utils/response');

const getBalance = async (req, res, next) => {
  try {
    const data = await getWallet(req.user._id);
    return sendSuccess(res, 200, 'Wallet details retrieved', data);
  } catch (err) {
    next(err);
  }
};

const recharge = async (req, res, next) => {
  try {
    const amount = parseFloat(req.body.amount);
    const data = await rechargeWallet(req.user._id, amount);
    return sendSuccess(res, 200, `Wallet recharged with ₹${amount}`, data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getBalance, recharge };
