const { 
  Order, 
  OrderProduct, 
  User, 
  Product, 
  ProductImage, 
  Invoice, 
  sequelize 
} = require('../../models');
const { Op } = require('sequelize');

exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate, 
      userId,
      minTotal,
      maxTotal,
      isQuote,
      paymentStatus
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
    
    if (minTotal) {
      whereClause.total = { ...whereClause.total, [Op.gte]: minTotal };
    }
    
    if (maxTotal) {
      whereClause.total = { ...whereClause.total, [Op.lte]: maxTotal };
    }
    
    if (isQuote !== undefined) {
      whereClause.isQuote = isQuote === 'true';
    }
    
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Invoice,
          as: 'invoice',
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      orders,
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

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        },
        {
          model: Product,
          as: 'products',
          through: {
            model: OrderProduct,
            as: 'orderDetails',
            attributes: ['quantity', 'unitPrice', 'totalPrice', 'installationRequired', 'installationFee']
          },
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
        },
        {
          model: Invoice,
          as: 'invoice',
          required: false
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status', 
        validStatuses 
      });
    }
    
    await order.update({ status });
    
    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order.id,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        message: 'Invalid payment status', 
        validPaymentStatuses 
      });
    }
    
    await order.update({ paymentStatus });
    
    // If there's an invoice, update its status too
    if (order.invoiceId) {
      const invoice = await Invoice.findByPk(order.invoiceId);
      if (invoice) {
        let invoiceStatus;
        switch (paymentStatus) {
          case 'paid':
            invoiceStatus = 'paid';
            break;
          case 'pending':
            invoiceStatus = 'pending';
            break;
          case 'failed':
            invoiceStatus = 'overdue';
            break;
          case 'refunded':
            invoiceStatus = 'cancelled';
            break;
          default:
            invoiceStatus = 'pending';
        }
        await invoice.update({ status: invoiceStatus });
      }
    }
    
    res.json({
      message: 'Payment status updated successfully',
      order: {
        id: order.id,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, { transaction });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Delete related OrderProducts
    await OrderProduct.destroy({
      where: { orderId: id },
      transaction
    });
    
    // Delete related Invoice if exists
    if (order.invoiceId) {
      await Invoice.destroy({
        where: { id: order.invoiceId },
        transaction
      });
    }
    
    await order.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({
      message: 'Order deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.restoreOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // This assumes you're using paranoid: true (soft delete) in your Order model
    const order = await Order.findByPk(id, { paranoid: false });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (!order.deletedAt) {
      return res.status(400).json({ message: 'Order is not deleted' });
    }
    
    await order.restore();
    
    // Restore related OrderProducts
    await OrderProduct.restore({
      where: { orderId: id }
    });
    
    // Restore related Invoice if exists
    if (order.invoiceId) {
      await Invoice.restore({
        where: { id: order.invoiceId }
      });
    }
    
    res.json({
      message: 'Order restored successfully',
      order: {
        id: order.id,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrderAnalytics = async (req, res) => {
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
    
    // Total orders
    const totalOrders = await Order.count({
      where: whereClause
    });
    
    // Total revenue
    const revenueResult = await Order.sum('total', {
      where: {
        ...whereClause,
        paymentStatus: 'paid'
      }
    });
    
    const totalRevenue = revenueResult || 0;
    
    // Orders by status
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['status']
    });
    
    // Orders by payment status
    const ordersByPaymentStatus = await Order.findAll({
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['paymentStatus']
    });
    
    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    res.json({
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersByStatus,
      ordersByPaymentStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
