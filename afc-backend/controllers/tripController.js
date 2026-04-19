const { tapIn, tapOut, getTripHistory } = require('../services/tripService');
const { sendSuccess } = require('../utils/response');

const handleTapIn = async (req, res, next) => {
  try {
    const { rfidUID, lat, lng } = req.body;
    const data = await tapIn({ rfidUID, lat: parseFloat(lat), lng: parseFloat(lng) });
    return sendSuccess(res, 201, 'Tap-In successful. Trip started.', data);
  } catch (err) {
    next(err);
  }
};

const handleTapOut = async (req, res, next) => {
  try {
    const { rfidUID, lat, lng } = req.body;
    const data = await tapOut({ rfidUID, lat: parseFloat(lat), lng: parseFloat(lng) });
    return sendSuccess(res, 200, 'Tap-Out successful. Trip completed.', data);
  } catch (err) {
    next(err);
  }
};

const history = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const data = await getTripHistory(req.user._id, { page, limit, status });
    return sendSuccess(res, 200, 'Trip history retrieved', data);
  } catch (err) {
    next(err);
  }
};

module.exports = { handleTapIn, handleTapOut, history };
