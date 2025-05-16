const express = require('express');
const router = express.Router();
const productController = require('../../controllers/Manager/productController');
const { authenticate, hasRole } = require('../../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductImages
} = require('../../middleware/productValidation');
const processImages = require('../../middleware/processImages');
const { handleMultipleFileUpload } = require('../../middleware/uploadMiddleware');

// All routes require authentication and Product Manager role
router.use(authenticate, hasRole('Product Manager'));

// Product routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', handleMultipleFileUpload, validateCreateProduct, processImages, productController.createProduct);
router.put('/:id', handleMultipleFileUpload, validateUpdateProduct, processImages, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/images', handleMultipleFileUpload, validateProductImages, processImages, productController.updateProductImages);

module.exports = router;
