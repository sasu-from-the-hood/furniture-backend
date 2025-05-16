const express = require('express');
const router = express.Router();
const inquiryController = require('../../controllers/user/inquiryController');
const { authenticate } = require('../../middleware/auth');

// All inquiry routes require authentication
router.use(authenticate);

// Inquiry routes
router.get('/', inquiryController.getUserInquiries);
router.get('/:id', inquiryController.getInquiryById);
router.post('/', inquiryController.createInquiry);

module.exports = router;
