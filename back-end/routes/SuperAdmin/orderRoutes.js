const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/SuperAdmin/orderController');
const { authenticate, isAdmin, hasPermission } = require('../../middleware/auth');

// Admin routes
router.get('/', authenticate, isAdmin, hasPermission('orders', 'read'), orderController.getAllOrders);
router.get('/:id', authenticate, isAdmin, hasPermission('orders', 'read'), orderController.getOrderById);
router.put('/:id/status', authenticate, isAdmin, hasPermission('orders', 'update'), orderController.updateOrderStatus);
router.put('/:id/payment', authenticate, isAdmin, hasPermission('orders', 'update'), orderController.updatePaymentStatus);
router.delete('/:id', authenticate, isAdmin, hasPermission('orders', 'delete'), orderController.deleteOrder);
router.post('/:id/restore', authenticate, isAdmin, hasPermission('orders', 'update'), orderController.restoreOrder);
router.get('/analytics/summary', authenticate, isAdmin, hasPermission('reports', 'read'), orderController.getOrderAnalytics);

module.exports = router;
