const { Inquiry, User, Product } = require('../../models');

/**
 * Create a new inquiry
 * @route POST /api/user/inquiries
 * @access Private (requires authentication)
 */
exports.createInquiry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, message, preferredContactMethod } = req.body;
    
    if (!productId || !message) {
      return res.status(400).json({ message: 'Product ID and message are required' });
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Create the inquiry
    const inquiry = await Inquiry.create({
      userId,
      productId,
      message,
      preferredContactMethod: preferredContactMethod || 'email',
      status: 'pending'
    });
    
    // Return the created inquiry
    res.status(201).json({
      message: 'Inquiry submitted successfully',
      inquiry: {
        id: inquiry.id,
        message: inquiry.message,
        preferredContactMethod: inquiry.preferredContactMethod,
        status: inquiry.status,
        createdAt: inquiry.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all inquiries for the authenticated user
 * @route GET /api/user/inquiries
 * @access Private (requires authentication)
 */
exports.getUserInquiries = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const inquiries = await Inquiry.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching user inquiries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get a specific inquiry by ID
 * @route GET /api/user/inquiries/:id
 * @access Private (requires authentication)
 */
exports.getInquiryById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const inquiry = await Inquiry.findOne({
      where: {
        id,
        userId
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ]
    });
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.json(inquiry);
  } catch (error) {
    console.error('Error fetching inquiry details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
