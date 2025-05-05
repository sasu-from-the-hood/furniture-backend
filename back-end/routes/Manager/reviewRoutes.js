const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/Manager/reviewController');
const { authenticate, hasRole } = require('../../middleware/auth');

// All routes require authentication and Product Manager role
router.use(authenticate, hasRole('Product Manager'));

// Review routes (read and update only)
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', reviewController.updateReview);

module.exports = router;
