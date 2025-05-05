const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/SuperAdmin/categoryController');
const { authenticate, isAdmin, hasPermission } = require('../../middleware/auth');
const { 
  validateCreateCategory, 
  validateUpdateCategory, 
  validateCategoryFilters 
} = require('../../middleware/categoryValidation');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:id', categoryController.getCategoryById);

// Admin routes
router.post(
  '/', 
  authenticate, 
  isAdmin, 
  hasPermission('categories', 'create'), 
  validateCreateCategory, 
  categoryController.createCategory
);

router.put(
  '/:id', 
  authenticate, 
  isAdmin, 
  hasPermission('categories', 'update'), 
  validateUpdateCategory, 
  categoryController.updateCategory
);

router.delete(
  '/:id', 
  authenticate, 
  isAdmin, 
  hasPermission('categories', 'delete'), 
  categoryController.deleteCategory
);

router.put(
  '/:id/filters', 
  authenticate, 
  isAdmin, 
  hasPermission('categories', 'update'), 
  validateCategoryFilters, 
  categoryController.updateCategoryFilters
);

module.exports = router;
