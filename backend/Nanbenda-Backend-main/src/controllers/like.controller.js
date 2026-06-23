const likeService = require('../services/like.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getLikedProducts = asyncHandler(async (req, res) => {
  const likedIds = await likeService.getLikedIds(req.user.id);
  res.json(new ApiResponse(200, likedIds, 'Liked product IDs fetched successfully'));
});

const toggleLike = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json(new ApiResponse(400, null, 'Product ID is required'));
  }
  const updatedLikedIds = await likeService.toggleLike(req.user.id, productId);
  res.json(new ApiResponse(200, updatedLikedIds, 'Product like status toggled successfully'));
});

module.exports = {
  getLikedProducts,
  toggleLike
};
