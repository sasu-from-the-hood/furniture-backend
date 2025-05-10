const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/SuperAdmin/settingController');
const { authenticate, isAdmin, hasPermission } = require('../../middleware/auth');

// Public routes
router.get('/', settingController.getAllSettings);
router.get('/footer', settingController.getFooterSettings);
router.get('/basic', settingController.getBasicSettings);
router.get('/:key', settingController.getSettingByKey);

// Admin routes
router.post('/', authenticate, isAdmin, hasPermission('settings', 'update'), settingController.createSetting);
router.put('/:key', authenticate, isAdmin, hasPermission('settings', 'update'), settingController.updateSetting);
router.delete('/:key', authenticate, isAdmin, hasPermission('settings', 'update'), settingController.deleteSetting);
router.post('/bulk-update', authenticate, isAdmin, hasPermission('settings', 'update'), settingController.bulkUpdateSettings);
router.post('/basic', authenticate, isAdmin, hasPermission('settings', 'update'), settingController.updateBasicSettings);

module.exports = router;
