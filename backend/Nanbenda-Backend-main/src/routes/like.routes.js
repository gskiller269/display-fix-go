const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { getLikedProducts, toggleLike } = require('../controllers/like.controller');

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: User favorite products management
 */

/**
 * @swagger
 * /likes:
 *   get:
 *     summary: Get list of product IDs liked by the current user
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of liked product IDs
 */
router.get('/', authenticateToken, getLikedProducts);

/**
 * @swagger
 * /likes/toggle:
 *   post:
 *     summary: Add or remove a product from the user's liked list
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated array of liked product IDs
 */
router.post('/toggle', authenticateToken, toggleLike);

module.exports = router;
