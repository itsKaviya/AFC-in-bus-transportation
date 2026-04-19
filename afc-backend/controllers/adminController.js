const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Trip = require('../models/Trip');
const { sendSuccess } = require('../utils/response');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { rfidUID: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-password'),
      User.countDocuments(query)
    ]);

    return sendSuccess(res, 200, 'Users retrieved', {
      users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;
    const query = type ? { type } : {};

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email rfidUID'),
      Transaction.countDocuments(query)
    ]);

    return sendSuccess(res, 200, 'Transactions retrieved', {
      transactions,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

const getTrips = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    const query = status ? { status } : {};

    const [trips, total] = await Promise.all([
      Trip.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email rfidUID'),
      Trip.countDocuments(query)
    ]);

    return sendSuccess(res, 200, 'Trips retrieved', {
      trips,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTrips, completedTrips, totalRecharge, totalDeductions] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Trip.countDocuments(),
      Trip.countDocuments({ status: 'completed' }),
      Transaction.aggregate([{ $match: { type: 'recharge' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { type: 'deduction' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);

    return sendSuccess(res, 200, 'System stats', {
      totalUsers,
      totalTrips,
      completedTrips,
      activeTrips: totalTrips - completedTrips,
      totalRecharge: totalRecharge[0]?.total || 0,
      totalFareCollected: totalDeductions[0]?.total || 0
    });
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    return sendSuccess(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getTransactions, getTrips, getStats, toggleUserStatus };
