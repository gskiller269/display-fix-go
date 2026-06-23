const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { 
  createRequest, 
  getAdminRequests, 
  getShopRequests, 
  getMyRequest,
  handleAction 
} = require('../controllers/role_request.controller');

router.use((req, res, next) => {
  console.log(`[DEBUG] RoleRequests - Route hit: ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * @swagger
 * tags:
 *   name: RoleRequests
 *   description: Applications for Shop Owner or Technician roles
 */

router.post('/', authenticateToken, createRequest);
router.get('/my', authenticateToken, getMyRequest);
router.get('/admin', authenticateToken, authorize(['admin']), getAdminRequests);
router.get('/shop', authenticateToken, authorize(['shop_owner']), getShopRequests);

/**
 * @swagger
 * /role-requests/{id}/action:
 *   patch:
 *     summary: Accept or Reject a role application
 *     description: |
 *       Updates the status of a role request. 
 *       If **accepted**:
 *       - The user's role is updated to the requested role (`shop_owner` or `technician`).
 *       - For `shop_owner`, the associated shop is activated.
 *       - For `technician`, the user is linked to the target shop.
 *     tags: [RoleRequests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 description: The new status for the request
 *     responses:
 *       200:
 *         description: Action processed successfully. Returns details of the update.
 *       400:
 *         description: Invalid status or request ID
 *       403:
 *         description: Unauthorized (requires admin or shop_owner role)
 *       404:
 *         description: Request not found
 */
router.patch('/:id/action', authenticateToken, authorize(['admin', 'shop_owner']), handleAction);
router.post('/:id/action', authenticateToken, authorize(['admin', 'shop_owner']), handleAction);

module.exports = router;
