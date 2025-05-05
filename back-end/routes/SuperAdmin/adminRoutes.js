const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/SuperAdmin/adminController');
const { authenticate, hasPermission, hasRole } = require('../../middleware/auth');
const { validateCreateAdmin, validateUpdateAdmin } = require('../../middleware/adminValidation');

router.get('/roles', authenticate, hasRole('Super Admin'), adminController.getAllRoles);

router.get('/', authenticate, hasRole('Super Admin'), hasPermission('users', 'read'), adminController.getAllAdmins);
router.get('/:id', authenticate, hasRole('Super Admin'), hasPermission('users', 'read'), adminController.getAdminById);
router.post('/', authenticate, hasRole('Super Admin'), hasPermission('users', 'create'), validateCreateAdmin, adminController.createAdmin);
router.put('/:id', authenticate, hasRole('Super Admin'), hasPermission('users', 'update'), validateUpdateAdmin, adminController.updateAdmin);
router.put('/:id/password', authenticate, hasRole('Super Admin'), hasPermission('users', 'update'), adminController.updateAdminPassword);
router.delete('/:id', authenticate, hasRole('Super Admin'), hasPermission('users', 'delete'), adminController.deleteAdmin);

module.exports = router;
