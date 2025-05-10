const express = require('express');
const router = express.Router();
const userReviewController = require('../controllers/userReviewController');
const { authenticate } = require('../middleware/auth');

// Public route to get reviews for a product
router.get('/products/:productId/reviews', userReviewController.getProductReviews);

// Protected route to create a review (requires authentication)
router.post('/products/:productId/reviews', authenticate, userReviewController.createReview);

module.exports = router;
