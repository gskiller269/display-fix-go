const reviewRepository = require('../repositories/review.repository');

class ReviewService {
  async getReviewsByProduct(productId) {
    return await reviewRepository.getByProductId(productId);
  }

  async getMyReviews(userId) {
    return await reviewRepository.getByUserId(userId);
  }

  async createReview(reviewData) {
    return await reviewRepository.create(reviewData);
  }

  async deleteReview(id, userId) {
    return await reviewRepository.delete(id, userId);
  }
}

module.exports = new ReviewService();
