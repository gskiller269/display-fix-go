const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { placeOrder, getUserOrders, getOrderDetails, getShopOrders } = require('../controllers/order.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         device_id:
 *           type: integer
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *     OrderItemDetails:
 *       type: object
 *       properties:
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         quantity:
 *           type: integer
 *         price_at_purchase:
 *           type: number
 *         image_url:
 *           type: string
 *     OrderResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         total_amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         payment_status:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         payment_method:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         city:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemDetails'
 *     OrderRequest:
 *       type: object
 *       required:
 *         - address_id
 *         - items
 *       properties:
 *         address_id:
 *           type: integer
 *         payment_method:
 *           type: string
 *           default: COD
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and checkout
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 */
router.post('/', authenticateToken, placeOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders with item summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderResponse'
 */
router.get('/', authenticateToken, getUserOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get detailed order information
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Full order details including address and item info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 */
router.get('/shop', authenticateToken, authorize(['shop_owner', 'admin']), getShopOrders);
router.get('/:id', authenticateToken, getOrderDetails);

module.exports = router;
