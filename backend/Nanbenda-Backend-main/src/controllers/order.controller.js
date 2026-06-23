const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const placeOrder = asyncHandler(async (req, res) => {
  const { address_id, items, payment_method } = req.body;
  
  if (!address_id || !items || items.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, "Address and items are required"));
  }

  const order = await orderService.placeOrder(req.user.id, { address_id, items, payment_method });
  res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  res.json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const order = await orderService.getOrderDetails(req.user.id, parseInt(id), req.user.role);
    if (!order) {
      return res.status(404).json(new ApiResponse(404, null, "Order not found"));
    }
    res.json(new ApiResponse(200, order, "Order details fetched successfully"));
  } catch (error) {
    res.status(403).json(new ApiResponse(403, null, error.message));
  }
});

const getShopOrders = asyncHandler(async (req, res) => {
  const shopService = require('../services/shop.service');
  const shop = await shopService.getMyShop(req.user.id);
  if (!shop) {
    return res.status(404).json(new ApiResponse(404, null, "Shop not found"));
  }
  const orders = await orderService.getShopOrders(shop.id);
  res.json(new ApiResponse(200, orders, "Shop orders fetched successfully"));
});

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderDetails,
  getShopOrders
};
