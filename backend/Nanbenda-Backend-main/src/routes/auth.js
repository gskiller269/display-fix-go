const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateProfileImage,
  getAllUsers,
  registerTechnician,
  updateStatus
} = require('../controllers/auth.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         mobile_number:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         profile_image_url:
 *           type: string
 *         status:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *     LoginRequest:
 *       type: object
 *       required:
 *         - identifier
 *         - password
 *       properties:
 *         identifier:
 *           type: string
 *           description: Username or mobile number
 *         password:
 *           type: string
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - mobile_number
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         mobile_number:
 *           type: string
 *         password:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, shop_owner, technician, customer]
 *         profile_image_url:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and profile management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or invalid data
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/register-technician:
 *   post:
 *     summary: Register a new technician (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/register-technician', authenticateToken, authorize(['admin']), upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'aadharImage', maxCount: 1 },
  { name: 'licenseImage', maxCount: 1 }
]), registerTechnician);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Update user profile details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/profile', authenticateToken, updateProfile);

/**
 * @swagger
 * /auth/profile-image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 */
router.post('/profile-image', authenticateToken, upload.single('profileImage'), updateProfileImage);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', authenticateToken, authorize(['admin']), getAllUsers);

router.patch('/status', authenticateToken, updateStatus);

module.exports = router;
