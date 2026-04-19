const mongoose = require('mongoose');
const User = require('../models/User');
const Trip = require('../models/Trip');
const { deductFare } = require('./walletService');
const { calculateDistance, calculateFare } = require('../utils/fareCalculator');
const logger = require('../utils/logger');

/**
 * Tap-In: Start a trip
 */
const tapIn = async ({ rfidUID, lat, lng }) => {
  const user = await User.findOne({ rfidUID: rfidUID.toUpperCase() });
  if (!user) throw Object.assign(new Error('RFID card not registered'), { statusCode: 404 });
  if (!user.isActive) throw Object.assign(new Error('Account deactivated'), { statusCode: 403 });

  // Check for existing in-progress trip
  const activeTrip = await Trip.findOne({ rfidUID: rfidUID.toUpperCase(), status: 'in-progress' });
  if (activeTrip) {
    throw Object.assign(new Error('An active trip already exists. Please tap out first.'), { statusCode: 409 });
  }

  // Check minimum balance
  const minBalance = parseFloat(process.env.BASE_FARE) || 10;
  if (user.walletBalance < minBalance) {
    throw Object.assign(
      new Error(`Insufficient wallet balance. Minimum required: ₹${minBalance}. Current: ₹${user.walletBalance}`),
      { statusCode: 402 }
    );
  }

  const trip = await Trip.create({
    user: user._id,
    rfidUID: rfidUID.toUpperCase(),
    tapIn: { lat, lng, timestamp: new Date() },
    status: 'in-progress'
  });

  logger.info(`Tap-In: User ${user._id}, Trip ${trip._id}, Location: (${lat}, ${lng})`);
  return { trip, user: { name: user.name, walletBalance: user.walletBalance } };
};

/**
 * Tap-Out: End a trip, calculate fare, deduct wallet
 */
const tapOut = async ({ rfidUID, lat, lng }) => {
  const user = await User.findOne({ rfidUID: rfidUID.toUpperCase() });
  if (!user) throw Object.assign(new Error('RFID card not registered'), { statusCode: 404 });

  const activeTrip = await Trip.findOne({ rfidUID: rfidUID.toUpperCase(), status: 'in-progress' });
  if (!activeTrip) {
    throw Object.assign(new Error('No active trip found. Please tap in first.'), { statusCode: 404 });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const distanceKm = calculateDistance(
      activeTrip.tapIn.lat,
      activeTrip.tapIn.lng,
      lat,
      lng
    );

    const fareDetails = calculateFare(distanceKm);

    const tapOutTime = new Date();
    const tapInTime = new Date(activeTrip.tapIn.timestamp);
    const durationMinutes = Math.round((tapOutTime - tapInTime) / 60000);

    // Deduct fare
    const { walletBalance, transaction } = await deductFare(user._id, fareDetails.totalFare, activeTrip._id, session);

    // Update trip
    activeTrip.tapOut = { lat, lng, timestamp: tapOutTime };
    activeTrip.distanceKm = distanceKm;
    activeTrip.fare = fareDetails;
    activeTrip.status = 'completed';
    activeTrip.transaction = transaction._id;
    activeTrip.duration = durationMinutes;
    await activeTrip.save({ session });

    // Update transaction reference
    transaction.reference = activeTrip._id;
    await transaction.save({ session });

    await session.commitTransaction();
    logger.info(`Tap-Out: User ${user._id}, Trip ${activeTrip._id}, Fare: ₹${fareDetails.totalFare}, Distance: ${distanceKm}km`);

    return {
      trip: activeTrip,
      fareDetails,
      walletBalance,
      user: { name: user.name }
    };
  } catch (err) {
    await session.abortTransaction();
    if (err.statusCode) throw err;
    throw Object.assign(new Error(err.message || 'Trip completion failed'), { statusCode: 500 });
  } finally {
    session.endSession();
  }
};

/**
 * Get trip history for a user
 */
const getTripHistory = async (userId, { page = 1, limit = 10, status }) => {
  const query = { user: userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [trips, total] = await Promise.all([
    Trip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('transaction', 'amount type status'),
    Trip.countDocuments(query)
  ]);

  return {
    trips,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = { tapIn, tapOut, getTripHistory };
