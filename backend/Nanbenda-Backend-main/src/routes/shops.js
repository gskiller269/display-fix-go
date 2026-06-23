const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { 
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
} = require('../controllers/shop.controller');
const upload = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Shops
 *   description: Shop management and discovery
 */

/**
 * @swagger
 * /shops:
 *   get:
 *     summary: Returns the list of all active shops
 *     tags: [Shops]
 */
router.get('/', getAllShops);
router.get('/active', getAllShops);

/**
 * @swagger
 * /shops/pending:
 *   get:
 *     summary: Get all pending shops (Admin only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 */
router.get('/pending', authenticateToken, authorize(['admin']), getPendingShops);

/**
 * @swagger
 * /shops/admin:
 *   get:
 *     summary: Get all shops list (Admin only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin', authenticateToken, authorize(['admin']), getAdminShops);

/**
 * @swagger
 * /shops/{id}/activate:
 *   post:
 *     summary: Activate a shop and upgrade owner role (Admin only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/activate', authenticateToken, authorize(['admin']), activateShop);

/**
 * @swagger
 * /shops/my-shop:
 *   get:
 *     summary: Get the shop details for the logged-in owner
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-shop', authenticateToken, getMyShop);

/**
 * @swagger
 * /shops:
 *   post:
 *     summary: Register a new shop (Owner only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shop'
 */
router.post('/', authenticateToken, registerShop);

/**
 * @swagger
 * /shops/{id}:
 *   get:
 *     summary: Get shop details by ID
 *     tags: [Shops]
 */
router.get('/:id', getShopById);

router.put('/:id', authenticateToken, updateShop);

/**
 * @swagger
 * /shops/my-shop/details:
 *   patch:
 *     summary: Update shop details (Owner only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               shop_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address:
 *                 type: string
 *               shop_image:
 *                 type: string
 *                 format: binary
 */
router.patch('/my-shop/details', authenticateToken, upload.single('shop_image'), updateMyShopDetails);
router.post('/my-shop/details', authenticateToken, upload.single('shop_image'), updateMyShopDetails);
router.get('/:id/technicians', authenticateToken, getShopTechnicians);

module.exports = router;
