const express = require('express');
const router = express.Router();
const { 
  getUserAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setAddressActive 
} = require('../controllers/address.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - full_name
 *         - mobile_number
 *         - address_line1
 *         - city
 *         - state
 *         - pincode
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         label:
 *           type: string
 *           default: Home
 *         full_name:
 *           type: string
 *         mobile_number:
 *           type: string
 *         address_line1:
 *           type: string
 *         address_line2:
 *           type: string
 *         landmark:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         pincode:
 *           type: string
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User address management
 */

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Get all addresses for the logged-in user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 */
router.get('/', authenticateToken, getUserAddresses);

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Add a new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Address created successfully
 */
router.post('/', authenticateToken, addAddress);

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
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
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Address updated successfully
 */
router.put('/:id', authenticateToken, updateAddress);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
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
 *         description: Address deleted successfully
 */
router.delete('/:id', authenticateToken, deleteAddress);

/**
 * @swagger
 * /addresses/{id}/set-active:
 *   patch:
 *     summary: Set address as active
 *     tags: [Addresses]
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
 *         description: Address set as active
 */
router.patch('/:id/set-active', authenticateToken, setAddressActive);

module.exports = router;
