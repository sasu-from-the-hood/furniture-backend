const express = require('express');
const router = express.Router();
const userController = require('../../controllers/SuperAdmin/userController');
const { authenticate, isAdmin, hasPermission } = require('../../middleware/auth');

// Get all users (with pagination, sorting, and filtering)
router.get(
  '/',
  authenticate,
  isAdmin,
  hasPermission('users', 'read'),
  userController.getAllUsers
);

// Get user statistics
router.get(
  '/stats/overview',
  authenticate,
  isAdmin,
  hasPermission('users', 'read'),
  userController.getUserStats
);

// Get multiple users by IDs
router.get(
  '/many',
  authenticate,
  isAdmin,
  hasPermission('users', 'read'),
  userController.getManyUsers
);

// Get a single user by ID
router.get(
  '/:id',
  authenticate,
  isAdmin,
  hasPermission('users', 'read'),
  userController.getUserById
);

// Create a new user
router.post(
  '/',
  authenticate,
  isAdmin,
  hasPermission('users', 'create'),
  userController.createUser
);

// Update a user
router.put(
  '/:id',
  authenticate,
  isAdmin,
  hasPermission('users', 'update'),
  userController.updateUser
);

// Update user password
router.put(
  '/:id/password',
  authenticate,
  isAdmin,
  hasPermission('users', 'update'),
  userController.updateUserPassword
);

// Delete a user
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  hasPermission('users', 'delete'),
  userController.deleteUser
);

module.exports = router;
