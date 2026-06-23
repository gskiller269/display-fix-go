const RepairService = require('../services/repair.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { processImage } = require('../utils/imageProcessor');

const VALID_STATUSES = ['pending', 'technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done'];

const createRepair = asyncHandler(async (req, res) => {
  const repairData = { ...req.body };
  
  // Remove service_type if accidentally sent by old clients
  delete repairData.service_type;

  if (req.files && req.files.length > 0) {
    // Auto compress each uploaded image
    await Promise.all(req.files.map(file => processImage(file.path, 1200, 80)));
    
    repairData.image_url = req.files.map(file => `/uploads/repairs/${file.filename}`).join(',');
  }

  const result = await RepairService.createRepair(req.user.id, repairData);
  return res.status(201).json(new ApiResponse(201, result, 'Repair booked successfully'));
});

const getActiveRepairs = asyncHandler(async (req, res) => {
  const repairs = await RepairService.getActiveRepairs(req.user.id);
  return res.status(200).json(new ApiResponse(200, repairs, 'Repairs fetched successfully'));
});

const getRepairById = asyncHandler(async (req, res) => {
  const repair = await RepairService.getRepairById(req.params.id, req.user.id, req.user.role);
  return res.status(200).json(new ApiResponse(200, repair, 'Repair details fetched successfully'));
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, technician_id, eta } = req.body;

  // Validate status value
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json(new ApiResponse(400, null, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`));
  }
  
  // Only admin, shop_owner, and technician can update status
  if (req.user.role !== 'admin' && req.user.role !== 'shop_owner' && req.user.role !== 'technician') {
    return res.status(403).json(new ApiResponse(403, null, 'Unauthorized to update status'));
  }

  await RepairService.updateStatus(req.params.id, { status, technician_id, eta }, req.user.id, req.user.role);
  return res.status(200).json(new ApiResponse(200, null, 'Status updated successfully'));
});

const updateLocation = asyncHandler(async (req, res) => {
  await RepairService.updateLocation(req.params.id, req.body);
  return res.status(200).json(new ApiResponse(200, null, 'Location updated successfully'));
});

const getShopRepairs = asyncHandler(async (req, res) => {
  const shopService = require('../services/shop.service');
  const shop = await shopService.getMyShop(req.user.id);
  if (!shop) {
    return res.status(404).json(new ApiResponse(404, null, "Shop not found"));
  }
  const repairs = await RepairService.getShopRepairs(shop.id);
  return res.status(200).json(new ApiResponse(200, repairs, 'Shop repairs fetched successfully'));
});

const getTechnicianRepairs = asyncHandler(async (req, res) => {
  const repairs = await RepairService.getTechnicianRepairs(req.user.id);
  return res.status(200).json(new ApiResponse(200, repairs, 'Technician repairs fetched successfully'));
});

module.exports = {
  createRepair,
  getActiveRepairs,
  getRepairById,
  updateStatus,
  updateLocation,
  getShopRepairs,
  getTechnicianRepairs
};
