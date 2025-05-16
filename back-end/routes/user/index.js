const express = require('express');
const router = express.Router();

const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const inquiryRoutes = require('./inquiryRoutes');

// Mount all user routes
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/inquiries', inquiryRoutes);

module.exports = router;
