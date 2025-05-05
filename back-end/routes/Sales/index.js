const express = require('express');
const router = express.Router();

const orderRoutes = require('./orderRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const customerRoutes = require('./customerRoutes');

// Mount all Sales Admin routes
router.use('/orders', orderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/customers', customerRoutes);

module.exports = router;
