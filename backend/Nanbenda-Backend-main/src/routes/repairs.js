const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { 
  createRepair, 
  getActiveRepairs, 
  getRepairById, 
  updateStatus, 
  updateLocation,
  getShopRepairs,
  getTechnicianRepairs
} = require('../controllers/repair.controller');

const upload = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Repairs
 *   description: Repair booking and tracking
 */

/**
 * @swagger
 * /repairs:
 *   post:
 *     summary: Create a new repair booking
 *     tags: [Repairs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - device_brand
 *               - device_model
 *               - problem_type
 *             properties:
 *               device_brand:
 *                 type: string
 *               device_model:
 *                 type: string
 *               problem_type:
 *                 type: string
 *               problem_description:
 *                 type: string
 *               address_id:
 *                 type: integer
 *               shop_id:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 4
 *     responses:
 *       201:
 *         description: Repair booked successfully
 */
router.post('/', authenticateToken, upload.array('images', 4), createRepair);

/**
 * @swagger
 * /repairs:
 *   get:
 *     summary: Get all active repairs for the logged-in user
 *     tags: [Repairs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active repairs
 */
router.get('/', authenticateToken, getActiveRepairs);
router.get('/shop', authenticateToken, authorize(['shop_owner', 'admin']), getShopRepairs);
router.get('/technician', authenticateToken, authorize(['technician']), getTechnicianRepairs);

/**
 * @swagger
 * /repairs/{id}:
 *   get:
 *     summary: Get repair details by ID
 *     tags: [Repairs]
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
 *         description: Repair details
 */
router.get('/:id', authenticateToken, getRepairById);

/**
 * @swagger
 * /repairs/{id}/status:
 *   patch:
 *     summary: Update repair status (admin/shop_owner only)
 *     tags: [Repairs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, technician_assigned, on_the_way, reached, repaired]
 *               technician_id:
 *                 type: integer
 *               eta:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status value
 *       403:
 *         description: Unauthorized
 */
router.patch('/:id/status', authenticateToken, updateStatus);

/**
 * @swagger
 * /repairs/{id}/location:
 *   patch:
 *     summary: Update technician location
 *     tags: [Repairs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated
 */
router.patch('/:id/location', authenticateToken, updateLocation);

module.exports = router;
