const express = require('express');
const router = express.Router();
const invoiceController = require('../../controllers/Sales/invoiceController');
const { authenticate, hasRole } = require('../../middleware/auth');

// All routes require authentication and Sales Admin role
router.use(authenticate, hasRole('Sales Admin'));

// Invoice routes
router.get('/', invoiceController.getAllInvoices);
router.get('/summary', invoiceController.getInvoiceSummary);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id/status', invoiceController.updateInvoiceStatus);
router.post('/:id/send', invoiceController.sendInvoiceEmail);

module.exports = router;
