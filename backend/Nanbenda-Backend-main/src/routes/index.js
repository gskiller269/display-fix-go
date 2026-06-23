const express = require('express');
const router = express.Router();

const productsRoutes = require('./products');
const productTypesRoutes = require('./product_types');
const commonIssuesRoutes = require('./common_issues');
const authRoutes = require('./auth');
const addressesRoutes = require('./addresses');
const repairsRoutes = require('./repairs');
const assistantRoutes = require('./assistant');
const ordersRoutes = require('./orders');
const shopsRoutes = require('./shops');
const roleRequestsRoutes = require('./role_requests');
const cartRoutes = require('./cart.routes');
const likeRoutes = require('./like.routes');
const bannersRoutes = require('./banners');
const locationRoutes = require('./location');
const reviewsRoutes = require('./reviews');
const imagesRoutes = require('./images');

router.use('/products', productsRoutes);
router.use('/product-types', productTypesRoutes);
router.use('/common-issues', commonIssuesRoutes);
router.use('/auth', authRoutes);
router.use('/addresses', addressesRoutes);
router.use('/repairs', repairsRoutes);
router.use('/assistant', assistantRoutes);
router.use('/orders', ordersRoutes);
router.use('/shops', shopsRoutes);
router.use('/role-requests', roleRequestsRoutes);
router.use('/cart', cartRoutes);
router.use('/likes', likeRoutes);
router.use('/banners', bannersRoutes);
router.use('/location', locationRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/images', imagesRoutes);

module.exports = router;
