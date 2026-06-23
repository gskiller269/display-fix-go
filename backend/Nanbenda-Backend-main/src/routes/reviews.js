const express = require('express');
const router = express.Router();
const { 
  getReviewsByProduct, 
  getMyReviews, 
  createReview, 
  deleteReview 
} = require('../controllers/review.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product reviews and ratings
 */

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Get reviews for a specific product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/product/:productId', getReviewsByProduct);

/**
 * @swagger
 * /reviews/my-reviews:
 *   get:
 *     summary: Get reviews written by the authenticated user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-reviews', authenticateToken, getMyReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', authenticateToken, deleteReview);

module.exports = router;
