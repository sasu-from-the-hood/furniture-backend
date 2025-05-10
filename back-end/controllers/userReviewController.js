const { Review, User, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get reviews for a specific product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`Fetching reviews for product ID: ${productId}`);

    const reviews = await Review.findAll({
      where: {
        productId,
        isApproved: true // Only return approved reviews
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'] // Include email for display in reviews
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${reviews.length} reviews for product ID: ${productId}`);

    // Calculate average rating
    const avgRating = await Review.findOne({
      where: {
        productId,
        isApproved: true
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
      ],
      raw: true
    });

    const responseData = {
      reviews,
      stats: {
        averageRating: avgRating ? parseFloat(avgRating.averageRating).toFixed(1) : 0,
        totalReviews: avgRating ? avgRating.totalReviews : 0
      }
    };

    console.log('Sending review response:', {
      reviewCount: reviews.length,
      stats: responseData.stats
    });

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, content } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      where: {
        userId,
        productId
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Check if user has purchased this product (for verified purchase badge)
    // This would require checking order history
    // For simplicity, we'll skip this check for now

    const review = await Review.create({
      userId,
      productId,
      rating,
      comment: content,
      isVerifiedPurchase: false, // Set based on purchase history check
      isApproved: true // Auto-approve for now, in production this might be false until reviewed
    });

    const newReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      review: newReview
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
