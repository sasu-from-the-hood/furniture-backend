const express = require('express');
const router = express.Router();
const productController = require('../../controllers/SuperAdmin/productController');
const { authenticate, isAdmin, hasPermission } = require('../../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductImages
} = require('../../middleware/productValidation');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post(
  '/',
  authenticate,
  isAdmin,
  hasPermission('products', 'create'),
  validateCreateProduct,
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  isAdmin,
  hasPermission('products', 'update'),
  validateUpdateProduct,
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  isAdmin,
  hasPermission('products', 'delete'),
  productController.deleteProduct
);

router.post(
  '/:id/restore',
  authenticate,
  isAdmin,
  hasPermission('products', 'update'),
  productController.restoreProduct
);

router.put(
  '/:id/images',
  authenticate,
  isAdmin,
  hasPermission('products', 'update'),
  validateProductImages,
  productController.updateProductImages
);

module.exports = router;
