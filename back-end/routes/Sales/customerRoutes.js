const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/Sales/customerController');
const { authenticate, hasRole } = require('../../middleware/auth');

// All routes require authentication and Sales Admin role
router.use(authenticate, hasRole('Sales Admin'));

// Customer routes
router.get('/', customerController.getAllCustomers);
router.get('/top', customerController.getTopCustomers);
router.get('/:id', customerController.getCustomerById);

module.exports = router;
