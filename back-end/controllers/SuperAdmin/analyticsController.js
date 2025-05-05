const { 
  Order, 
  OrderProduct, 
  Product, 
  User, 
  Category, 
  Inquiry, 
  Review, 
  sequelize 
} = require('../../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get current date and date 30 days ago
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Total revenue
    const totalRevenue = await Order.sum('total', {
      where: {
        paymentStatus: 'paid'
      }
    }) || 0;
    
    // Revenue in last 30 days
    const recentRevenue = await Order.sum('total', {
      where: {
        paymentStatus: 'paid',
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    }) || 0;
    
    // Total orders
    const totalOrders = await Order.count();
    
    // Orders in last 30 days
    const recentOrders = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    
    // Total products
    const totalProducts = await Product.count();
    
    // Active products
    const activeProducts = await Product.count({
      where: {
        isActive: true
      }
    });
    
    // Total users
    const totalUsers = await User.count({
      where: {
        roleId: null // Only count regular users, not admins
      }
    });
    
    // New users in last 30 days
    const newUsers = await User.count({
      where: {
        roleId: null,
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    
    // Total categories
    const totalCategories = await Category.count();
    
    // Total inquiries
    const totalInquiries = await Inquiry.count();
    
    // Pending inquiries
    const pendingInquiries = await Inquiry.count({
      where: {
        status: 'pending'
      }
    });
    
    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    res.json({
      revenue: {
        total: totalRevenue,
        recent: recentRevenue
      },
      orders: {
        total: totalOrders,
        recent: recentOrders
      },
      products: {
        total: totalProducts,
        active: activeProducts
      },
      users: {
        total: totalUsers,
        new: newUsers
      },
      categories: totalCategories,
      inquiries: {
        total: totalInquiries,
        pending: pendingInquiries
      },
      avgOrderValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let dateFormat;
    let groupByClause;
    
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u'; // ISO week number
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    // Different databases use different date formatting functions
    if (sequelize.options.dialect === 'mysql') {
      groupByClause = sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat);
    } else if (sequelize.options.dialect === 'postgres') {
      groupByClause = sequelize.fn('TO_CHAR', sequelize.col('createdAt'), dateFormat);
    } else {
      // Default to strftime for SQLite and others
      groupByClause = sequelize.fn('strftime', dateFormat, sequelize.col('createdAt'));
    }
    
    const whereClause = {
      paymentStatus: 'paid'
    };
    
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
    
    // Sales by time period
    const salesByTimePeriod = await Order.findAll({
      attributes: [
        [groupByClause, 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalSales']
      ],
      where: whereClause,
      group: ['period'],
      order: [[sequelize.col('period'), 'ASC']]
    });
    
    // Sales by category
    const salesByCategory = await OrderProduct.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('OrderProduct.totalPrice')), 'totalSales']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'categoryId'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      where: {
        '$Order.paymentStatus$': 'paid',
        ...(startDate && endDate ? {
          '$Order.createdAt$': {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        } : startDate ? {
          '$Order.createdAt$': {
            [Op.gte]: new Date(startDate)
          }
        } : endDate ? {
          '$Order.createdAt$': {
            [Op.lte]: new Date(endDate)
          }
        } : {})
      },
      group: ['Product.categoryId'],
      order: [[sequelize.fn('SUM', sequelize.col('OrderProduct.totalPrice')), 'DESC']]
    });
    
    // Top selling products
    const topSellingProducts = await OrderProduct.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalSales']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ],
      where: {
        '$Order.paymentStatus$': 'paid',
        ...(startDate && endDate ? {
          '$Order.createdAt$': {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        } : startDate ? {
          '$Order.createdAt$': {
            [Op.gte]: new Date(startDate)
          }
        } : endDate ? {
          '$Order.createdAt$': {
            [Op.lte]: new Date(endDate)
          }
        } : {})
      },
      group: ['productId'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 10
    });
    
    res.json({
      salesByTimePeriod,
      salesByCategory,
      topSellingProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProductAnalytics = async (req, res) => {
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
    
    // Products by category
    const productsByCategory = await Product.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'productCount']
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      group: ['categoryId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });
    
    // Products by status
    const productsByStatus = await Product.findAll({
      attributes: [
        'inStock',
        [sequelize.fn('COUNT', sequelize.col('id')), 'productCount']
      ],
      group: ['inStock']
    });
    
    // Most reviewed products
    const mostReviewedProducts = await Review.findAll({
      attributes: [
        'productId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ],
      where: whereClause,
      group: ['productId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });
    
    // Most inquired products
    const mostInquiredProducts = await Inquiry.findAll({
      attributes: [
        'productId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'inquiryCount']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ],
      where: whereClause,
      group: ['productId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });
    
    res.json({
      productsByCategory,
      productsByStatus,
      mostReviewedProducts,
      mostInquiredProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get current date and date 30 days ago
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const whereClause = {
      roleId: null // Only count regular users, not admins
    };
    
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
    
    // New user registrations over time
    let dateFormat = '%Y-%m-%d';
    let groupByClause;
    
    // Different databases use different date formatting functions
    if (sequelize.options.dialect === 'mysql') {
      groupByClause = sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat);
    } else if (sequelize.options.dialect === 'postgres') {
      groupByClause = sequelize.fn('TO_CHAR', sequelize.col('createdAt'), dateFormat);
    } else {
      // Default to strftime for SQLite and others
      groupByClause = sequelize.fn('strftime', dateFormat, sequelize.col('createdAt'));
    }
    
    const userRegistrations = await User.findAll({
      attributes: [
        [groupByClause, 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'userCount']
      ],
      where: whereClause,
      group: ['date'],
      order: [[sequelize.col('date'), 'ASC']]
    });
    
    // Top customers by order value
    const topCustomers = await Order.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalSpent']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      where: {
        paymentStatus: 'paid'
      },
      group: ['userId'],
      order: [[sequelize.fn('SUM', sequelize.col('total')), 'DESC']],
      limit: 10
    });
    
    // User retention (users who have placed more than one order)
    const userRetention = await Order.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      group: ['userId'],
      having: sequelize.literal('COUNT(id) > 1'),
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });
    
    // Total users
    const totalUsers = await User.count({
      where: {
        roleId: null
      }
    });
    
    // Active users (users who have placed at least one order)
    const activeUsers = await Order.count({
      attributes: ['userId'],
      distinct: true
    });
    
    // Retention rate
    const retentionRate = totalUsers > 0 ? (userRetention.length / totalUsers) * 100 : 0;
    
    res.json({
      userRegistrations,
      topCustomers,
      userRetention,
      totalUsers,
      activeUsers,
      retentionRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
