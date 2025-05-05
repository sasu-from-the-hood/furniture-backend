const express = require('express');
const router = express.Router();

const adminRoutes = require('./adminRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const orderRoutes = require('./orderRoutes');
const inquiryRoutes = require('./inquiryRoutes');
const settingRoutes = require('./settingRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Mount all SuperAdmin routes
router.use('/admins', adminRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/settings', settingRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;