const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/SuperAdmin/analyticsController');
const { authenticate, isAdmin, hasPermission } = require('../../middleware/auth');

// All analytics routes require admin access and reports read permission
router.use(authenticate, isAdmin, hasPermission('reports', 'read'));

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/sales', analyticsController.getSalesAnalytics);
router.get('/products', analyticsController.getProductAnalytics);
router.get('/users', analyticsController.getUserAnalytics);

module.exports = router;
