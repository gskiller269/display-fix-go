const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/image.controller');
const upload = require('../middlewares/upload.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/', authenticateToken, upload.single('image'), ImageController.uploadImage);
router.post('/public', upload.single('image'), ImageController.uploadImage);
router.get('/', authenticateToken, ImageController.getImages);

module.exports = router;
