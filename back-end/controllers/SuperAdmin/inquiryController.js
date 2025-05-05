const { Inquiry, User, Product, ProductImage, sequelize } = require('../../models');
const { Op } = require('sequelize');

exports.getAllInquiries = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate, 
      userId,
      productId,
      contactMethod
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (productId) {
      whereClause.productId = productId;
    }
    
    if (contactMethod) {
      whereClause.preferredContactMethod = contactMethod;
    }
    
    const { count, rows: inquiries } = await Inquiry.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku'],
          include: [
            {
              model: ProductImage,
              as: 'images',
              where: {
                isPrimary: true
              },
              required: false,
              limit: 1
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      inquiries,
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

exports.getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inquiry = await Inquiry.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        },
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: ProductImage,
              as: 'images',
              where: {
                isPrimary: true
              },
              required: false,
              limit: 1
            }
          ]
        }
      ]
    });
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.json({ inquiry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    const inquiry = await Inquiry.findByPk(id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    const validStatuses = ['pending', 'in-progress', 'resolved'];
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status', 
        validStatuses 
      });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    
    await inquiry.update(updateData);
    
    res.json({
      message: 'Inquiry updated successfully',
      inquiry: {
        id: inquiry.id,
        status: inquiry.status,
        adminNotes: inquiry.adminNotes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inquiry = await Inquiry.findByPk(id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    await inquiry.destroy();
    
    res.json({
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getInquiryAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Total inquiries
    const totalInquiries = await Inquiry.count({
      where: whereClause
    });
    
    // Inquiries by status
    const inquiriesByStatus = await Inquiry.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['status']
    });
    
    // Inquiries by contact method
    const inquiriesByContactMethod = await Inquiry.findAll({
      attributes: [
        'preferredContactMethod',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['preferredContactMethod']
    });
    
    // Most inquired products
    const mostInquiredProducts = await Inquiry.findAll({
      attributes: [
        'productId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['productId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 5,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ]
    });
    
    res.json({
      totalInquiries,
      inquiriesByStatus,
      inquiriesByContactMethod,
      mostInquiredProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
