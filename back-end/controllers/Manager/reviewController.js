const { Review, User, Product } = require('../../models');
const { Op } = require('sequelize');

exports.getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      productId, 
      rating, 
      isApproved,
      isVerifiedPurchase
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (productId) {
      whereClause.productId = productId;
    }
    
    if (rating) {
      whereClause.rating = rating;
    }
    
    if (isApproved !== undefined) {
      whereClause.isApproved = isApproved === 'true';
    }
    
    if (isVerifiedPurchase !== undefined) {
      whereClause.isVerifiedPurchase = isVerifiedPurchase === 'true';
    }
    
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      reviews,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ]
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json({ review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, adminResponse } = req.body;
    
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Product Managers can only update approval status and admin response
    await review.update({
      isApproved: isApproved !== undefined ? isApproved : review.isApproved,
      adminResponse: adminResponse !== undefined ? adminResponse : review.adminResponse
    });
    
    const updatedReview = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ]
    });
    
    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
