const RoleRequestService = require('../services/role_request.service');
const ShopService = require('../services/shop.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const createRequest = asyncHandler(async (req, res) => {
  const { requested_role, shop_details, target_id, message, aadhar_image_id, shop_doc_image_id } = req.body;

  if (requested_role === 'technician') {
    if (!target_id) {
      return res.status(400).json(new ApiResponse(400, null, 'Please select a shop to join'));
    }
  }

  const requestId = await RoleRequestService.createRequest(req.user.id, {
    requested_role,
    target_id,
    message,
    shop_details,
    aadhar_image_id,
    shop_doc_image_id
  });

  res.status(201).json(new ApiResponse(201, { requestId }, 'Role request submitted successfully'));
});

const getAdminRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const requests = await RoleRequestService.getAdminRequests(status);
  res.json(new ApiResponse(200, requests, 'Admin requests fetched successfully'));
});

const getShopRequests = asyncHandler(async (req, res) => {
  // Get shop owned by this user
  const shop = await ShopService.getMyShop(req.user.id);
  if (!shop) {
    return res.status(404).json(new ApiResponse(404, null, 'No shop found for this owner'));
  }
  
  const requests = await RoleRequestService.getShopRequests(shop.id);
  res.json(new ApiResponse(200, requests, 'Shop technician requests fetched successfully'));
});

const getMyRequest = asyncHandler(async (req, res) => {
  const request = await RoleRequestService.getMyRequest(req.user.id);
  res.json(new ApiResponse(200, request || null, 'My role request fetched'));
});

const handleAction = asyncHandler(async (req, res) => {
  console.log(`[DEBUG] handleAction hit for ID: ${req.params.id}, body:`, req.body);
  const { status } = req.body;
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json(new ApiResponse(400, null, 'Status must be "accepted" or "rejected"'));
  }
  const result = await RoleRequestService.handleAction(req.params.id, status);
  res.json(new ApiResponse(200, result, 'Action processed successfully'));
});

module.exports = {
  createRequest,
  getAdminRequests,
  getShopRequests,
  getMyRequest,
  handleAction
};
