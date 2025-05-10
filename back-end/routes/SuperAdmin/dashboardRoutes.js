const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/SuperAdmin/dashboardController');
const { authenticate } = require('../../middleware/auth');

// All dashboard routes require authentication and admin privileges
router.use(authenticate);

// Dashboard routes
router.get('/summary', dashboardController.getDashboardSummary);
router.get('/sales', dashboardController.getSalesAnalytics);

module.exports = router;
