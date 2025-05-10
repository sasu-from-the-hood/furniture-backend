const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const reviewRoutes = require('./reviewRoutes');
const dashboardController = require('../../controllers/SuperAdmin/dashboardController');
const { authenticate, isAdmin, hasPermission } = require('../../middleware/auth');

// Mount all Product Manager routes
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/reviews', reviewRoutes);

// Dashboard routes
router.get(
  '/dashboard/summary',
  authenticate,
  isAdmin,
  hasPermission('dashboard', 'read'),
  dashboardController.getDashboardSummary
);

module.exports = router;
