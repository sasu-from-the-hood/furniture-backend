const { 
  User, 
  Product, 
  Order, 
  Category, 
  sequelize 
} = require('../../models');
const { Op } = require('sequelize');

/**
 * Get dashboard summary data
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    // Get counts for main entities
    const [
      userCount,
      productCount,
      orderCount,
      categoryCount,
      recentOrders,
      topProducts,
      salesByMonth
    ] = await Promise.all([
      // Total users
      User.count(),
      
      // Total products
      Product.count(),
      
      // Total orders
      Order.count(),
      
      // Total categories
      Category.count(),
      
      // Recent orders
      Order.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      }),
      
      // Top selling products
      Product.findAll({
        attributes: [
          'id',
          'title',
          'price',
          'stockQuantity',
          [sequelize.literal('(SELECT COUNT(*) FROM OrderProducts WHERE OrderProducts.productId = Product.id)'), 'orderCount']
        ],
        order: [[sequelize.literal('orderCount'), 'DESC']],
        limit: 5
      }),
      
      // Sales by month (for the current year)
      Order.findAll({
        attributes: [
          [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
          [sequelize.fn('SUM', sequelize.col('total')), 'totalSales'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
        ],
        where: {
          createdAt: {
            [Op.gte]: new Date(new Date().getFullYear(), 0, 1) // Start of current year
          },
          status: {
            [Op.not]: 'cancelled'
          }
        },
        group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
        order: [[sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']]
      })
    ]);
    
    // Format sales by month data
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const formattedSalesByMonth = salesByMonth.map(item => ({
      month: monthNames[item.dataValues.month - 1],
      totalSales: parseFloat(item.dataValues.totalSales || 0),
      orderCount: parseInt(item.dataValues.orderCount || 0)
    }));
    
    res.json({
      counts: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        categories: categoryCount
      },
      recentOrders,
      topProducts,
      salesByMonth: formattedSalesByMonth
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get sales analytics
 */
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set default date range to current month if not provided
    const start = startDate 
      ? new Date(startDate) 
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const end = endDate 
      ? new Date(endDate) 
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    
    // Get sales data
    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalSales'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end]
        },
        status: {
          [Op.not]: 'cancelled'
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });
    
    res.json({
      salesData: salesData.map(item => ({
        date: item.dataValues.date,
        totalSales: parseFloat(item.dataValues.totalSales || 0),
        orderCount: parseInt(item.dataValues.orderCount || 0)
      }))
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
