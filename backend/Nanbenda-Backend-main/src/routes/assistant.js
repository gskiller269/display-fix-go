const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { chat, getHistory, clearHistory } = require('../controllers/assistant.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     AssistantChat:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *         device_ids:
 *           type: array
 *           items:
 *             type: integer
 */

/**
 * @swagger
 * tags:
 *   name: Assistant
 *   description: AI Assistant (Gemini) integration
 */

/**
 * @swagger
 * /assistant/chat:
 *   post:
 *     summary: Chat with Nanbenda AI Assistant (supports multiple products for comparison)
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssistantChat'
 *     responses:
 *       200:
 *         description: AI Response
 */
router.post('/chat', authenticateToken, chat);

/**
 * @swagger
 * /assistant/history:
 *   get:
 *     summary: Get chat history for the user
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of previous interactions
 *   delete:
 *     summary: Clear chat history for the user
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History cleared
 */
router.get('/history', authenticateToken, getHistory);
router.delete('/history', authenticateToken, clearHistory);

module.exports = router;
