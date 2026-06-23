const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getFeaturedProducts,
  getBestSellers,
  getMostClickedProducts,
  getRandomProducts,
  getProductById,
  getBrands,
  getModelsByBrand,
  getShopProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementClicks,
  getProductsByShop
} = require('../controllers/product.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

/**
 * @swagger
 * /products/{id}/click:
 *   post:
 *     summary: Increment click count for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Click incremented successfully
 *       404:
 *         description: Product not found
 */
router.post('/:id/click', incrementClicks);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

/**
 * @swagger
 * /products/brands:
 *   get:
 *     summary: Returns a list of unique brands already in the database
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of unique brands
 */
router.get('/brands', getBrands);

/**
 * @swagger
 * /products/models:
 *   get:
 *     summary: Returns a list of unique models for a specific brand
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: brand
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/models', getModelsByBrand);

/**
 * @swagger
 * /products/featured:
 *   get:
 *     summary: Returns a list of featured products
 *     tags: [Products]
 */
router.get('/featured', getFeaturedProducts);

/**
 * @swagger
 * /products/best-sellers:
 *   get:
 *     summary: Returns a list of best selling products
 *     tags: [Products]
 */
router.get('/best-sellers', getBestSellers);

/**
 * @swagger
 * /products/most-clicked:
 *   get:
 *     summary: Returns a list of most clicked products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products sorted by click count
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/most-clicked', getMostClickedProducts);

/**
 * @swagger
 * /products/random:
 *   get:
 *     summary: Returns a list of random products
 *     tags: [Products]
 */
router.get('/random', getRandomProducts);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Returns the list of all the products
 *     tags: [Products]
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /products/shop:
 *   get:
 *     summary: Get products belonging to the authenticated shop
 *     tags: [Products]
 */
router.get('/shop', authenticateToken, getShopProducts);
router.get('/shop/:shopId', getProductsByShop);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type_id
 *               - brand
 *               - model
 *               - price
 *             properties:
 *               type_id:
 *                 type: integer
 *               shop_id:
 *                 type: integer
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               description:
 *                 type: string
 *               image_ids:
 *                 type: string
 *                 description: Comma separated image IDs
 *               price:
 *                 type: number
 *               ram:
 *                 type: string
 *               processor:
 *                 type: string
 *               active:
 *                 type: boolean
 *               active_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, upload.array('images', 5), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get the product by id
 *     tags: [Products]
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update the product by id
 *     tags: [Products]
 */
router.put('/:id', authenticateToken, upload.array('images', 5), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Remove the product by id
 *     tags: [Products]
 */
router.delete('/:id', deleteProduct);

module.exports = router;
