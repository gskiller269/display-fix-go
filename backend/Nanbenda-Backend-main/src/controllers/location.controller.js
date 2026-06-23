const locationService = require('../services/location.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const updateLocation = asyncHandler(async (req, res) => {
  const { tracking_type, target_id, lat, lng, speed, bearing } = req.body;
  
  if (!tracking_type || !target_id || !lat || !lng) {
    return res.status(400).json(new ApiResponse(400, null, "Missing required location fields"));
  }

  const locationData = {
    tracking_type,
    target_id,
    technician_id: req.user.id,
    lat,
    lng,
    speed,
    bearing
  };

  await locationService.updateLocation(locationData);
  res.json(new ApiResponse(200, locationData, "Location updated and broadcasted"));
});

const getLocation = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const location = await locationService.getLocation(type, id);
  res.json(new ApiResponse(200, location, "Current location fetched"));
});

module.exports = {
  updateLocation,
  getLocation
};
