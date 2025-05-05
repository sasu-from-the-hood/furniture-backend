const { User, Order, Inquiry, sequelize } = require('../../models');
const { Op } = require('sequelize');

exports.getAllCustomers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {
      roleId: null // Only get regular customers, not admins
    };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Validate sort field to prevent SQL injection
    const validSortFields = ['createdAt', 'name', 'email'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = validSortOrders.includes(sortOrder) ? sortOrder : 'DESC';
    
    const { count, rows: customers } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: offset,
      order: [[orderField, orderDirection]]
    });
    
    // Get order counts for each customer
    const customerIds = customers.map(customer => customer.id);
    
    const orderCounts = await Order.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalSpent']
      ],
      where: {
        userId: { [Op.in]: customerIds }
      },
      group: ['userId']
    });
    
    // Create a map of customer ID to order count and total spent
    const orderCountMap = {};
    orderCounts.forEach(count => {
      orderCountMap[count.userId] = {
        orderCount: parseInt(count.get('orderCount')),
        totalSpent: parseFloat(count.get('totalSpent') || 0)
      };
    });
    
    // Add order count and total spent to each customer
    const customersWithStats = customers.map(customer => {
      const stats = orderCountMap[customer.id] || { orderCount: 0, totalSpent: 0 };
      return {
        ...customer.toJSON(),
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent
      };
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      customers: customersWithStats,
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

exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await User.findOne({
      where: { 
        id,
        roleId: null // Only get regular customers, not admins
      },
      attributes: { exclude: ['password'] }
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get customer stats
    const orderCount = await Order.count({ where: { userId: id } });
    const totalSpent = await Order.sum('total', { 
      where: { 
        userId: id,
        paymentStatus: 'paid'
      } 
    }) || 0;
    const inquiryCount = await Inquiry.count({ where: { userId: id } });
    
    // Get latest order
    const latestOrder = await Order.findOne({
      where: { userId: id },
      order: [['createdAt', 'DESC']]
    });
    
    // Get latest inquiry
    const latestInquiry = await Inquiry.findOne({
      where: { userId: id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      customer,
      stats: {
        orderCount,
        totalSpent,
        inquiryCount,
        latestOrderDate: latestOrder ? latestOrder.createdAt : null,
        latestInquiryDate: latestInquiry ? latestInquiry.createdAt : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTopCustomers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get customers with highest total spent
    const topSpenders = await Order.findAll({
      attributes: [
        'userId',
        [sequelize.fn('SUM', sequelize.col('total')), 'totalSpent'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
      ],
      where: {
        paymentStatus: 'paid'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          where: {
            roleId: null // Only include regular customers
          }
        }
      ],
      group: ['userId'],
      order: [[sequelize.fn('SUM', sequelize.col('total')), 'DESC']],
      limit: parseInt(limit)
    });
    
    // Get customers with most orders
    const mostFrequent = await Order.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalSpent']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          where: {
            roleId: null // Only include regular customers
          }
        }
      ],
      group: ['userId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: parseInt(limit)
    });
    
    // Get newest customers
    const newestCustomers = await User.findAll({
      where: {
        roleId: null // Only include regular customers
      },
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json({
      topSpenders: topSpenders.map(spender => ({
        id: spender.user.id,
        name: spender.user.name,
        email: spender.user.email,
        totalSpent: parseFloat(spender.get('totalSpent')),
        orderCount: parseInt(spender.get('orderCount'))
      })),
      mostFrequent: mostFrequent.map(customer => ({
        id: customer.user.id,
        name: customer.user.name,
        email: customer.user.email,
        orderCount: parseInt(customer.get('orderCount')),
        totalSpent: parseFloat(customer.get('totalSpent'))
      })),
      newestCustomers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
