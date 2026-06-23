const shopService = require('../services/shop.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getAllShops = asyncHandler(async (req, res) => {
  const shops = await shopService.listActiveShops();
  res.json(new ApiResponse(200, shops, "Shops fetched successfully"));
});

const getAdminShops = asyncHandler(async (req, res) => {
  const shops = await shopService.listAllShops();
  res.json(new ApiResponse(200, shops, "All shops fetched successfully"));
});

const getShopById = asyncHandler(async (req, res) => {
  const shop = await shopService.getShopById(req.params.id);
  if (!shop) {
    return res.status(404).json(new ApiResponse(404, null, "Shop not found"));
  }
  res.json(new ApiResponse(200, shop, "Shop fetched successfully"));
});

const getPendingShops = asyncHandler(async (req, res) => {
  const shops = await shopService.listPendingShops();
  res.json(new ApiResponse(200, shops, "Pending shops fetched successfully"));
});

const activateShop = asyncHandler(async (req, res) => {
  const result = await shopService.activateShop(req.params.id);
  res.json(new ApiResponse(200, result, "Shop activated successfully"));
});


const getMyShop = asyncHandler(async (req, res) => {
  const shop = await shopService.getMyShop(req.user.id);
  if (!shop) {
    return res.status(404).json(new ApiResponse(404, null, "You don't have a registered shop"));
  }
  res.json(new ApiResponse(200, shop));
});

const registerShop = asyncHandler(async (req, res) => {
  try {
    const shop = await shopService.registerShop(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, shop, "Shop registered successfully. Awaiting approval."));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, null, error.message));
  }
});

const updateShop = asyncHandler(async (req, res) => {
  try {
    await shopService.updateShop(req.user.id, req.params.id, req.body);
    res.json(new ApiResponse(200, null, "Shop updated successfully"));
  } catch (error) {
    res.status(403).json(new ApiResponse(403, null, error.message));
  }
});

const updateMyShopDetails = asyncHandler(async (req, res) => {
  try {
    const ownerId = req.user.id;
    const shop = await shopService.getMyShop(ownerId);
    if (!shop) {
      return res.status(404).json(new ApiResponse(404, null, "No shop found for this owner"));
    }

    const { shop_name, description, phone_number, address, latitude, longitude } = req.body;
    const shopData = { shop_name, description, phone_number, address, latitude, longitude };

    if (req.file) {
      shopData.image_url = `uploads/shops/${req.file.filename}`;
    }

    await shopService.updateShop(ownerId, shop.id, shopData);
    res.json(new ApiResponse(200, null, "Shop details updated successfully"));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

const getShopTechnicians = asyncHandler(async (req, res) => {
  const technicians = await shopService.getShopTechnicians(req.params.id);
  res.json(new ApiResponse(200, technicians, "Technicians fetched successfully"));
});

module.exports = {
  getAllShops,
  getShopById,
  getMyShop,
  registerShop,
  updateShop,
  getPendingShops,
  activateShop,
  updateMyShopDetails,
  getAdminShops,
  getShopTechnicians
};
