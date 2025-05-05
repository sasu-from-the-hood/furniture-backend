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
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

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
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
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
    
    // Validate sort field to prevent SQL injection
    const validSortFields = ['createdAt', 'total', 'status', 'paymentStatus'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = validSortOrders.includes(sortOrder) ? sortOrder : 'DESC';
    
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
      order: [[orderField, orderDirection]]
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
    const { paymentStatus, paymentMethod, paymentNotes } = req.body;
    
    const order = await Order.findByPk(id, {
      include: [
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
    
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        message: 'Invalid payment status', 
        validPaymentStatuses 
      });
    }
    
    const updateData = {
      paymentStatus,
      paymentMethod: paymentMethod || order.paymentMethod
    };
    
    if (paymentNotes) {
      updateData.notes = order.notes 
        ? `${order.notes}\n\nPayment Notes (${new Date().toISOString()}):\n${paymentNotes}`
        : `Payment Notes (${new Date().toISOString()}):\n${paymentNotes}`;
    }
    
    await order.update(updateData);
    
    // If there's an invoice, update its status too
    if (order.invoice) {
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
      await order.invoice.update({ status: invoiceStatus });
    } else if (paymentStatus === 'paid') {
      // If payment is confirmed and there's no invoice, generate one
      await generateInvoice(order.id);
    }
    
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Invoice,
          as: 'invoice',
          required: false
        }
      ]
    });
    
    res.json({
      message: 'Payment status updated successfully',
      order: {
        id: updatedOrder.id,
        paymentStatus: updatedOrder.paymentStatus,
        paymentMethod: updatedOrder.paymentMethod,
        invoice: updatedOrder.invoice
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await generateInvoice(id);
    
    if (!invoice) {
      return res.status(400).json({ message: 'Failed to generate invoice' });
    }
    
    res.json({
      message: 'Invoice generated successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCustomerOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where: { userId },
      include: [
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
    
    // Get summary statistics
    const totalSpent = await Order.sum('total', {
      where: { 
        userId,
        paymentStatus: 'paid'
      }
    }) || 0;
    
    const orderCount = count;
    const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
    
    res.json({
      user,
      orders,
      stats: {
        totalOrders: orderCount,
        totalSpent,
        avgOrderValue
      },
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

exports.getOrderSummary = async (req, res) => {
  try {
    // Get counts by status
    const pendingCount = await Order.count({ where: { status: 'pending' } });
    const confirmedCount = await Order.count({ where: { status: 'confirmed' } });
    const processingCount = await Order.count({ where: { status: 'processing' } });
    const shippedCount = await Order.count({ where: { status: 'shipped' } });
    const deliveredCount = await Order.count({ where: { status: 'delivered' } });
    const cancelledCount = await Order.count({ where: { status: 'cancelled' } });
    
    // Get counts by payment status
    const pendingPaymentCount = await Order.count({ where: { paymentStatus: 'pending' } });
    const paidCount = await Order.count({ where: { paymentStatus: 'paid' } });
    const failedPaymentCount = await Order.count({ where: { paymentStatus: 'failed' } });
    const refundedCount = await Order.count({ where: { paymentStatus: 'refunded' } });
    
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrderCount = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });
    
    // Get this week's orders
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    const weekOrderCount = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: startOfWeek
        }
      }
    });
    
    // Get this month's orders
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Start of month
    startOfMonth.setHours(0, 0, 0, 0);
    const monthOrderCount = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });
    
    // Get total revenue
    const totalRevenue = await Order.sum('total', {
      where: {
        paymentStatus: 'paid'
      }
    }) || 0;
    
    // Get this month's revenue
    const monthRevenue = await Order.sum('total', {
      where: {
        paymentStatus: 'paid',
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    }) || 0;
    
    res.json({
      statusCounts: {
        pending: pendingCount,
        confirmed: confirmedCount,
        processing: processingCount,
        shipped: shippedCount,
        delivered: deliveredCount,
        cancelled: cancelledCount
      },
      paymentStatusCounts: {
        pending: pendingPaymentCount,
        paid: paidCount,
        failed: failedPaymentCount,
        refunded: refundedCount
      },
      timePeriods: {
        today: todayOrderCount,
        thisWeek: weekOrderCount,
        thisMonth: monthOrderCount
      },
      revenue: {
        total: totalRevenue,
        thisMonth: monthRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to generate invoice
async function generateInvoice(orderId) {
  const transaction = await sequelize.transaction();
  
  try {
    const order = await Order.findByPk(orderId, {
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
          }
        },
        {
          model: Invoice,
          as: 'invoice',
          required: false
        }
      ],
      transaction
    });
    
    if (!order) {
      await transaction.rollback();
      return null;
    }
    
    // If invoice already exists, return it
    if (order.invoice) {
      await transaction.rollback();
      return order.invoice;
    }
    
    // Generate invoice number (format: INV-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomStr}`;
    
    // Create invoice record
    const invoice = await Invoice.create({
      orderId: order.id,
      invoiceNumber,
      amount: order.total,
      status: order.paymentStatus === 'paid' ? 'paid' : 'pending',
      dueDate: new Date(date.setDate(date.getDate() + 14)), // Due in 14 days
      notes: `Invoice for order #${order.id}`
    }, { transaction });
    
    // Update order with invoice ID
    await order.update({
      invoiceId: invoice.id
    }, { transaction });
    
    // Generate PDF invoice
    const pdfPath = path.join(__dirname, '../../public/invoices');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(pdfPath)) {
      fs.mkdirSync(pdfPath, { recursive: true });
    }
    
    const pdfFilename = `invoice-${invoiceNumber}.pdf`;
    const pdfFilePath = path.join(pdfPath, pdfFilename);
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe PDF to file
    doc.pipe(fs.createWriteStream(pdfFilePath));
    
    // Add content to PDF
    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Invoice Number: ${invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`);
    doc.moveDown();
    
    // Customer info
    doc.fontSize(12).text('Bill To:');
    doc.fontSize(10).text(`${order.user.name}`);
    doc.text(`${order.user.email}`);
    doc.text(`${order.user.phone || 'No phone provided'}`);
    doc.text(`${order.user.address || 'No address provided'}`);
    doc.moveDown();
    
    // Order info
    doc.fontSize(12).text('Order Details:');
    doc.fontSize(10).text(`Order ID: ${order.id}`);
    doc.text(`Order Date: ${order.createdAt.toLocaleDateString()}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.moveDown();
    
    // Table header
    doc.fontSize(10);
    doc.text('Item', 50, doc.y, { width: 250 });
    doc.text('Qty', 300, doc.y, { width: 50 });
    doc.text('Unit Price', 350, doc.y, { width: 100 });
    doc.text('Total', 450, doc.y, { width: 100 });
    doc.moveDown();
    
    // Draw line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    
    // Table rows
    let y = doc.y;
    order.products.forEach(product => {
      const orderDetails = product.orderDetails;
      
      doc.text(product.title, 50, y, { width: 250 });
      doc.text(orderDetails.quantity.toString(), 300, y, { width: 50 });
      doc.text(`$${orderDetails.unitPrice.toFixed(2)}`, 350, y, { width: 100 });
      doc.text(`$${orderDetails.totalPrice.toFixed(2)}`, 450, y, { width: 100 });
      
      y = doc.y + 15;
      doc.moveDown();
      
      // Add installation fee if applicable
      if (orderDetails.installationRequired) {
        doc.text(`Installation for ${product.title}`, 50, y, { width: 250 });
        doc.text('1', 300, y, { width: 50 });
        doc.text(`$${orderDetails.installationFee.toFixed(2)}`, 350, y, { width: 100 });
        doc.text(`$${orderDetails.installationFee.toFixed(2)}`, 450, y, { width: 100 });
        
        y = doc.y + 15;
        doc.moveDown();
      }
    });
    
    // Draw line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    
    // Totals
    doc.text('Subtotal:', 350, doc.y, { width: 100 });
    doc.text(`$${order.subtotal.toFixed(2)}`, 450, doc.y, { width: 100 });
    doc.moveDown();
    
    if (order.tax > 0) {
      doc.text('Tax:', 350, doc.y, { width: 100 });
      doc.text(`$${order.tax.toFixed(2)}`, 450, doc.y, { width: 100 });
      doc.moveDown();
    }
    
    if (order.deliveryFee > 0) {
      doc.text('Delivery Fee:', 350, doc.y, { width: 100 });
      doc.text(`$${order.deliveryFee.toFixed(2)}`, 450, doc.y, { width: 100 });
      doc.moveDown();
    }
    
    if (order.installationFee > 0) {
      doc.text('Installation Fee:', 350, doc.y, { width: 100 });
      doc.text(`$${order.installationFee.toFixed(2)}`, 450, doc.y, { width: 100 });
      doc.moveDown();
    }
    
    // Draw line
    doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    
    // Grand total
    doc.fontSize(12).text('Total:', 350, doc.y, { width: 100 });
    doc.text(`$${order.total.toFixed(2)}`, 450, doc.y, { width: 100 });
    
    // Finalize PDF
    doc.end();
    
    // Update invoice with PDF URL
    const pdfUrl = `/invoices/${pdfFilename}`;
    await invoice.update({
      pdfUrl
    }, { transaction });
    
    await transaction.commit();
    
    return invoice;
  } catch (error) {
    await transaction.rollback();
    console.error('Error generating invoice:', error);
    return null;
  }
}
