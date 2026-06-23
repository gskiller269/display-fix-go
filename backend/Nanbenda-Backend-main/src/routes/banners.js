const express = require('express');
const router = express.Router();
const { getActiveBanners, getBannerById, createBanner, updateBanner, deleteBanner } = require('../controllers/banner.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Home page banner management
 */

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Get all active banners
 *     tags: [Banners]
 */
router.get('/', getActiveBanners);

/**
 * @swagger
 * /banners/{id}:
 *   get:
 *     summary: Get banner by id
 *     tags: [Banners]
 */
router.get('/:id', getBannerById);

/**
 * @swagger
 * /banners:
 *   post:
 *     summary: Create a new banner (Admin)
 *     tags: [Banners]
 */
router.post('/', authenticateToken, upload.single('image'), createBanner);

/**
 * @swagger
 * /banners/{id}:
 *   put:
 *     summary: Update a banner (Admin)
 *     tags: [Banners]
 */
router.put('/:id', authenticateToken, upload.single('image'), updateBanner);

/**
 * @swagger
 * /banners/{id}:
 *   delete:
 *     summary: Delete a banner (Admin)
 *     tags: [Banners]
 */
router.delete('/:id', deleteBanner);

module.exports = router;
