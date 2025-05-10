const express = require('express');
const router = express.Router();

const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');

// Mount all user routes
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
