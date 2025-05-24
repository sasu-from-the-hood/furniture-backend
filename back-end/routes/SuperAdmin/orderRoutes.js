const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/SuperAdmin/orderController');
const { authenticate, isAdmin, hasPermission } = require('../../middleware/auth');

// Admin routes
router.get('/', authenticate, orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/status', authenticate,  orderController.updateOrderStatus);
router.put('/:id/payment', authenticate, orderController.updatePaymentStatus);
router.delete('/:id', authenticate, isAdmin,orderController.deleteOrder);
router.post('/:id/restore', authenticate,  orderController.restoreOrder);
router.get('/analytics/summary', authenticate,orderController.getOrderAnalytics);

module.exports = router;
