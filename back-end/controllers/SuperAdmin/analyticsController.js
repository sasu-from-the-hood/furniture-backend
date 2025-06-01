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
    console.log('Analytics dashboard endpoint called');

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

    // Get revenue data for the last 30 days
    const revenueData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      where: {
        paymentStatus: 'paid',
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    // Get orders data for the last 30 days
    const ordersData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'total']
      ],
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

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
      avgOrderValue,
      revenueData: revenueData.map(r => ({
        date: r.get('date'),
        total: r.get('total')
      })),
      ordersData: ordersData.map(o => ({
        date: o.get('date'),
        total: o.get('total')
      }))
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSalesAnalytics = async (req, res) => {
  try {
    console.log('Analytics sales endpoint called');
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
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('Order.total')), 'totalSales']
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
        },
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            paymentStatus: 'paid',
            ...(startDate && endDate ? {
              createdAt: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
              }
            } : startDate ? {
              createdAt: {
                [Op.gte]: new Date(startDate)
              }
            } : endDate ? {
              createdAt: {
                [Op.lte]: new Date(endDate)
              }
            } : {})
          }
        }
      ],
      group: ['Product.categoryId', 'Product.category.id'],
      order: [[sequelize.fn('SUM', sequelize.col('OrderProduct.totalPrice')), 'DESC']]
    });
    
    // Top selling products
    const topSellingProducts = await OrderProduct.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('OrderProduct.quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('OrderProduct.totalPrice')), 'totalSales']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        },
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            paymentStatus: 'paid',
            ...(startDate && endDate ? {
              createdAt: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
              }
            } : startDate ? {
              createdAt: {
                [Op.gte]: new Date(startDate)
              }
            } : endDate ? {
              createdAt: {
                [Op.lte]: new Date(endDate)
              }
            } : {})
          }
        }
      ],
      group: ['OrderProduct.productId', 'product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('OrderProduct.quantity')), 'DESC']],
      limit: 10
    });
    
    res.json({
      salesByTimePeriod,
      salesByCategory,
      topSellingProducts
    });
  } catch (error) {
    console.error('Error in getSalesAnalytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProductAnalytics = async (req, res) => {
  try {
    console.log('Analytics products endpoint called');
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
        [sequelize.fn('COUNT', sequelize.col('Product.id')), 'productCount']
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      group: ['categoryId', 'category.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Product.id')), 'DESC']]
    });
    
    // Products by status
    const productsByStatus = await Product.findAll({
      attributes: [
        'inStock',
        [sequelize.fn('COUNT', sequelize.col('Product.id')), 'productCount']
      ],
      group: ['inStock']
    });
    
    // Most reviewed products
    const mostReviewedProducts = await Review.findAll({
      attributes: [
        'productId',
        [sequelize.fn('COUNT', sequelize.col('Review.id')), 'reviewCount'],
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
      group: ['productId', 'product.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Review.id')), 'DESC']],
      limit: 10
    });
    
    // Most inquired products
    const mostInquiredProducts = await Inquiry.findAll({
      attributes: [
        'productId',
        [sequelize.fn('COUNT', sequelize.col('Inquiry.id')), 'inquiryCount']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku']
        }
      ],
      where: whereClause,
      group: ['productId', 'product.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Inquiry.id')), 'DESC']],
      limit: 10
    });
    
    res.json({
      productsByCategory,
      productsByStatus,
      mostReviewedProducts,
      mostInquiredProducts
    });
  } catch (error) {
    console.error('Error in getProductAnalytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    console.log('Analytics users endpoint called');
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
        [sequelize.fn('COUNT', sequelize.col('User.id')), 'userCount']
      ],
      where: whereClause,
      group: ['date'],
      order: [[sequelize.col('date'), 'ASC']]
    });
    
    // Top customers by order value
    const topCustomers = await Order.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('Order.total')), 'totalSpent']
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
      group: ['userId', 'user.id'],
      order: [[sequelize.fn('SUM', sequelize.col('Order.total')), 'DESC']],
      limit: 10
    });
    
    // User retention (users who have placed more than one order)
    const userRetention = await Order.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      group: ['userId', 'user.id'],
      having: sequelize.literal('COUNT(Order.id) > 1'),
      order: [[sequelize.fn('COUNT', sequelize.col('Order.id')), 'DESC']]
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
    console.error('Error in getUserAnalytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
