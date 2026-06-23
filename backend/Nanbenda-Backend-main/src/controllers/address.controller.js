const addressService = require('../services/address.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user.id);
  res.json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});

const addAddress = asyncHandler(async (req, res) => {
  const address = await addressService.addAddress(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, address, "Address added successfully"));
});

const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await addressService.updateAddress(id, req.user.id, req.body);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Address not found"));
  }
  res.json(new ApiResponse(200, { id, ...req.body }, "Address updated successfully"));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await addressService.deleteAddress(id, req.user.id);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Address not found or unauthorized"));
  }
  res.json(new ApiResponse(200, null, "Address deleted successfully"));
});

const setAddressActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await addressService.setAddressActive(id, req.user.id);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Address not found"));
  }
  res.json(new ApiResponse(200, null, "Address set as active successfully"));
});

module.exports = {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setAddressActive
};
