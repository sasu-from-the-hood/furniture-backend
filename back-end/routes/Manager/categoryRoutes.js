const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/Manager/categoryController');
const { authenticate, hasRole } = require('../../middleware/auth');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryFilters
} = require('../../middleware/categoryValidation');

// All routes require authentication and Product Manager role
router.use(authenticate, hasRole('Product Manager'));

// Category routes
router.get('/', categoryController.getAllCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:id', categoryController.getCategoryById);
router.post('/', validateCreateCategory, categoryController.createCategory);
router.put('/:id', validateUpdateCategory, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.put('/:id/filters', validateCategoryFilters, categoryController.updateCategoryFilters);

module.exports = router;
