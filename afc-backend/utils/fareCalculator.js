/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const EARTH_RADIUS_KM = 6371;

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return parseFloat(distance.toFixed(4));
};

/**
 * Calculate fare based on distance
 * @param {number} distanceKm - Distance in kilometers
 * @returns {object} Fare breakdown
 */
const calculateFare = (distanceKm) => {
  const baseFare = parseFloat(process.env.BASE_FARE) || 10;
  const perKmRate = parseFloat(process.env.PER_KM_RATE) || 2;

  const distanceFare = distanceKm * perKmRate;
  const totalFare = parseFloat((baseFare + distanceFare).toFixed(2));

  return {
    baseFare,
    perKmRate,
    distanceKm,
    distanceFare: parseFloat(distanceFare.toFixed(2)),
    totalFare
  };
};

module.exports = { calculateDistance, calculateFare };
