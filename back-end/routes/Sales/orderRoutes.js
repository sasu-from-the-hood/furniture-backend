const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/Sales/orderController');
const { authenticate, hasRole } = require('../../middleware/auth');

// All routes require authentication and Sales Admin role
router.use(authenticate, hasRole('Sales Admin'));

// Order routes
router.get('/', orderController.getAllOrders);
router.get('/summary', orderController.getOrderSummary);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/payment', orderController.updatePaymentStatus);
router.post('/:id/invoice', orderController.generateInvoice);
router.get('/customer/:userId', orderController.getCustomerOrderHistory);

module.exports = router;
