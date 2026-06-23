const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { 
  getAllCommonIssues, 
  getCommonIssueById, 
  createCommonIssue, 
  updateCommonIssue, 
  deleteCommonIssue 
} = require('../controllers/common_issue.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     CommonIssue:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the common issue
 *         name:
 *           type: string
 *           description: The name of the issue (e.g., Cracked Screen, Battery Drain)
 *         description:
 *           type: string
 *           description: A detailed description of the issue
 *         image_url:
 *           type: string
 *           description: URL of the issue icon/image
 *       example:
 *         id: 1
 *         name: "Cracked Screen"
 *         description: "Physical damage to the display glass or digitizer."
 *         image_url: "/uploads/common_issues/cracked_screen.png"
 */

/**
 * @swagger
 * tags:
 *   name: CommonIssues
 *   description: The common issues managing API
 */

/**
 * @swagger
 * /common-issues:
 *   get:
 *     summary: Returns the list of all common issues
 *     tags: [CommonIssues]
 *     responses:
 *       200:
 *         description: The list of common issues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommonIssue'
 */
router.get('/', getAllCommonIssues);

/**
 * @swagger
 * /common-issues/{id}:
 *   get:
 *     summary: Get a common issue by id
 *     tags: [CommonIssues]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The common issue id
 *     responses:
 *       200:
 *         description: The common issue description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonIssue'
 *       404:
 *         description: The common issue was not found
 */
router.get('/:id', getCommonIssueById);

/**
 * @swagger
 * /common-issues:
 *   post:
 *     summary: Create a new common issue
 *     tags: [CommonIssues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommonIssue'
 *     responses:
 *       201:
 *         description: The common issue was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonIssue'
 * /common-issues/with-image:
 *   post:
 *     summary: Create a new common issue with image upload
 *     tags: [CommonIssues]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: The common issue was successfully created
 */
router.post('/', upload.single('image'), createCommonIssue);

/**
 * @swagger
 * /common-issues/{id}:
 *   put:
 *     summary: Update a common issue by id
 *     tags: [CommonIssues]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The common issue id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommonIssue'
 *     responses:
 *       200:
 *         description: The common issue was updated
 *       404:
 *         description: The common issue was not found
 */
router.put('/:id', upload.single('image'), updateCommonIssue);

/**
 * @swagger
 * /common-issues/{id}:
 *   delete:
 *     summary: Remove a common issue by id
 *     tags: [CommonIssues]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The common issue id
 *     responses:
 *       200:
 *         description: The common issue was deleted
 *       404:
 *         description: The common issue was not found
 */
router.delete('/:id', deleteCommonIssue);

module.exports = router;
