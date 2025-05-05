const express = require('express');
const router = express.Router();
const inquiryController = require('../../controllers/SuperAdmin/inquiryController');
const { authenticate, isAdmin, hasPermission } = require('../../middleware/auth');

// Admin routes
router.get('/', authenticate, isAdmin, hasPermission('inquiries', 'read'), inquiryController.getAllInquiries);
router.get('/:id', authenticate, isAdmin, hasPermission('inquiries', 'read'), inquiryController.getInquiryById);
router.put('/:id', authenticate, isAdmin, hasPermission('inquiries', 'update'), inquiryController.updateInquiryStatus);
router.delete('/:id', authenticate, isAdmin, hasPermission('inquiries', 'delete'), inquiryController.deleteInquiry);
router.get('/analytics/summary', authenticate, isAdmin, hasPermission('reports', 'read'), inquiryController.getInquiryAnalytics);

module.exports = router;
