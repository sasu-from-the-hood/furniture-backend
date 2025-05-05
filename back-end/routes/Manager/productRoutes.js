const express = require('express');
const router = express.Router();
const productController = require('../../controllers/Manager/productController');
const { authenticate, hasRole } = require('../../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductImages
} = require('../../middleware/productValidation');

// All routes require authentication and Product Manager role
router.use(authenticate, hasRole('Product Manager'));

// Product routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', validateCreateProduct, productController.createProduct);
router.put('/:id', validateUpdateProduct, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/images', validateProductImages, productController.updateProductImages);

module.exports = router;
