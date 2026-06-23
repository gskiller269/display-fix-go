const reviewService = require('../services/review.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getReviewsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const reviews = await reviewService.getReviewsByProduct(productId);
  res.json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getMyReviews(req.user.id);
  res.json(new ApiResponse(200, reviews, "Your reviews fetched successfully"));
});

const createReview = asyncHandler(async (req, res) => {
  const { product_id, rating, comment } = req.body;
  
  if (!product_id || !rating) {
    return res.status(400).json(new ApiResponse(400, null, "Product ID and rating are required"));
  }

  const reviewData = {
    user_id: req.user.id,
    product_id,
    rating,
    comment
  };

  const review = await reviewService.createReview(reviewData);
  res.status(201).json(new ApiResponse(201, review, "Review created successfully"));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await reviewService.deleteReview(id, req.user.id);
  
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Review not found or unauthorized"));
  }

  res.json(new ApiResponse(200, null, "Review deleted successfully"));
});

module.exports = {
  getReviewsByProduct,
  getMyReviews,
  createReview,
  deleteReview
};
