const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/user/orderController');
const { authenticate } = require('../../middleware/auth');

// All order routes require authentication
router.use(authenticate);

// Order routes
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.post('/payment', orderController.initiatePayment);
router.get('/track/:id', orderController.trackOrder);

module.exports = router;
