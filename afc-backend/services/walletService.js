const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

/**
 * Get wallet balance and recent transactions
 */
const getWallet = async (userId) => {
  const user = await User.findById(userId).select('name email rfidUID walletBalance');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const transactions = await Transaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('reference', 'distanceKm tapIn tapOut status');

  return { wallet: user, transactions };
};

/**
 * Recharge wallet
 */
const rechargeWallet = async (userId, amount) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const balanceBefore = user.walletBalance;
    user.walletBalance = parseFloat((balanceBefore + amount).toFixed(2));
    await user.save({ session });

    const transaction = await Transaction.create(
      [
        {
          user: userId,
          type: 'recharge',
          amount,
          balanceBefore,
          balanceAfter: user.walletBalance,
          description: `Wallet recharge of ₹${amount}`
        }
      ],
      { session }
    );

    await session.commitTransaction();
    logger.info(`Wallet recharged: User ${userId}, Amount ₹${amount}`);
    return { walletBalance: user.walletBalance, transaction: transaction[0] };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Deduct fare from wallet (used internally by trip service)
 */
const deductFare = async (userId, amount, tripId, session) => {
  const user = await User.findById(userId).session(session);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  if (user.walletBalance < amount) {
    throw Object.assign(new Error(`Insufficient balance. Required: ₹${amount}, Available: ₹${user.walletBalance}`), {
      statusCode: 402
    });
  }

  const balanceBefore = user.walletBalance;
  user.walletBalance = parseFloat((balanceBefore - amount).toFixed(2));
  await user.save({ session });

  const transaction = await Transaction.create(
    [
      {
        user: userId,
        type: 'deduction',
        amount,
        balanceBefore,
        balanceAfter: user.walletBalance,
        description: `Fare deduction for trip`,
        reference: tripId
      }
    ],
    { session }
  );

  return { walletBalance: user.walletBalance, transaction: transaction[0] };
};

module.exports = { getWallet, rechargeWallet, deductFare };
