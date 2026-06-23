const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { updateLocation, getLocation } = require('../controllers/location.controller');

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: Real-time location tracking for technicians
 */

/**
 * @swagger
 * /location:
 *   post:
 *     summary: Update current location (Technician only)
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, updateLocation);

/**
 * @swagger
 * /location/{type}/{id}:
 *   get:
 *     summary: Get current location for a specific repair or order
 *     tags: [Location]
 */
router.get('/:type/:id', getLocation);

module.exports = router;
