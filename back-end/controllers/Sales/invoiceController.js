const { Invoice, Order, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

exports.getAllInvoices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      minAmount,
      maxAmount,
      orderId,
      invoiceNumber,
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
    
    if (minAmount) {
      whereClause.amount = { ...whereClause.amount, [Op.gte]: minAmount };
    }
    
    if (maxAmount) {
      whereClause.amount = { ...whereClause.amount, [Op.lte]: maxAmount };
    }
    
    if (orderId) {
      whereClause.orderId = orderId;
    }
    
    if (invoiceNumber) {
      whereClause.invoiceNumber = { [Op.like]: `%${invoiceNumber}%` };
    }
    
    // Validate sort field to prevent SQL injection
    const validSortFields = ['createdAt', 'amount', 'status', 'dueDate', 'invoiceNumber'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = validSortOrders.includes(sortOrder) ? sortOrder : 'DESC';
    
    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[orderField, orderDirection]]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      invoices,
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

exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone', 'address']
            }
          ]
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order'
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    const validStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status', 
        validStatuses 
      });
    }
    
    const updateData = { status };
    
    if (notes) {
      updateData.notes = invoice.notes 
        ? `${invoice.notes}\n\nUpdate (${new Date().toISOString()}):\n${notes}`
        : `Update (${new Date().toISOString()}):\n${notes}`;
    }
    
    await invoice.update(updateData);
    
    // Update order payment status if invoice status changes
    if (invoice.order) {
      let paymentStatus;
      switch (status) {
        case 'paid':
          paymentStatus = 'paid';
          break;
        case 'pending':
          paymentStatus = 'pending';
          break;
        case 'overdue':
          paymentStatus = 'failed';
          break;
        case 'cancelled':
          paymentStatus = 'refunded';
          break;
        default:
          paymentStatus = 'pending';
      }
      
      await invoice.order.update({ paymentStatus });
    }
    
    res.json({
      message: 'Invoice status updated successfully',
      invoice: {
        id: invoice.id,
        status: invoice.status,
        notes: invoice.notes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    if (!invoice.pdfUrl) {
      return res.status(400).json({ message: 'Invoice PDF not found' });
    }
    
    if (!invoice.order || !invoice.order.user || !invoice.order.user.email) {
      return res.status(400).json({ message: 'Customer email not found' });
    }
    
    // Get PDF file path
    const pdfPath = path.join(__dirname, '../../public', invoice.pdfUrl);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(400).json({ message: 'Invoice PDF file not found' });
    }
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASS || 'password'
      }
    });
    
    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Furniture Store" <sales@example.com>',
      to: invoice.order.user.email,
      subject: `Invoice #${invoice.invoiceNumber} for your order`,
      text: `Dear ${invoice.order.user.name},\n\nThank you for your order. Please find attached your invoice #${invoice.invoiceNumber}.\n\nTotal amount: $${invoice.amount.toFixed(2)}\nDue date: ${invoice.dueDate.toLocaleDateString()}\n\nIf you have any questions, please contact our customer service.\n\nBest regards,\nFurniture Store Team`,
      html: `
        <h2>Invoice #${invoice.invoiceNumber}</h2>
        <p>Dear ${invoice.order.user.name},</p>
        <p>Thank you for your order. Please find attached your invoice #${invoice.invoiceNumber}.</p>
        <p><strong>Total amount:</strong> $${invoice.amount.toFixed(2)}<br>
        <strong>Due date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
        <p>If you have any questions, please contact our customer service.</p>
        <p>Best regards,<br>Furniture Store Team</p>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          path: pdfPath
        }
      ]
    });
    
    // Update invoice with sent date
    await invoice.update({
      notes: invoice.notes 
        ? `${invoice.notes}\n\nInvoice sent by email on ${new Date().toISOString()}`
        : `Invoice sent by email on ${new Date().toISOString()}`
    });
    
    res.json({
      message: 'Invoice sent successfully',
      emailInfo: {
        messageId: info.messageId,
        recipient: invoice.order.user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getInvoiceSummary = async (req, res) => {
  try {
    // Get counts by status
    const pendingCount = await Invoice.count({ where: { status: 'pending' } });
    const paidCount = await Invoice.count({ where: { status: 'paid' } });
    const overdueCount = await Invoice.count({ where: { status: 'overdue' } });
    const cancelledCount = await Invoice.count({ where: { status: 'cancelled' } });
    
    // Get total amount
    const totalAmount = await Invoice.sum('amount') || 0;
    const paidAmount = await Invoice.sum('amount', { where: { status: 'paid' } }) || 0;
    const pendingAmount = await Invoice.sum('amount', { where: { status: 'pending' } }) || 0;
    const overdueAmount = await Invoice.sum('amount', { where: { status: 'overdue' } }) || 0;
    
    // Get overdue invoices
    const today = new Date();
    const overdueInvoices = await Invoice.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [Op.lt]: today
        }
      },
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      limit: 10,
      order: [['dueDate', 'ASC']]
    });
    
    res.json({
      statusCounts: {
        pending: pendingCount,
        paid: paidCount,
        overdue: overdueCount,
        cancelled: cancelledCount
      },
      amounts: {
        total: totalAmount,
        paid: paidAmount,
        pending: pendingAmount,
        overdue: overdueAmount
      },
      overdueInvoices
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
