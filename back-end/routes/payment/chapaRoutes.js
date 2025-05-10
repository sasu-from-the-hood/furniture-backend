const express = require('express');
const router = express.Router();
const chapaController = require('../../controllers/payment/chapaController');
const { authenticate } = require('../../middleware/auth');

// Initialize payment (requires authentication)
router.post('/initialize', authenticate, chapaController.initializePayment);

// Verify payment (authentication optional - allows verification even if session expired)
router.get('/verify/:tx_ref', chapaController.verifyPayment);

// Payment callback (webhook from Chapa)
router.post('/callback', chapaController.handleCallback);

module.exports = router;
