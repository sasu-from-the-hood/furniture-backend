const { Order, OrderProduct, Product, ProductImage, User, sequelize  ,Cart} = require('../../models');
const { Op } = require('sequelize');

// Get all orders for the authenticated user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            model: OrderProduct,
            as: 'orderDetails',
            attributes: ['quantity', 'unitPrice', 'totalPrice']
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
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific order by ID for the authenticated user
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: {
        id,
        userId
      },
      include: [
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
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new order from cart items
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { items, totalAmount, user: userData, paymentMethod = 'chapa' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'No items in cart' });
    }

    // Check stock for each item before proceeding
    for (const item of items) {
      const product = await Product.findByPk(item.furnitureId, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product with ID ${item.furnitureId} not found` });
      }
      if (!product.stockQuantity || product.stockQuantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ message: `Not enough stock for product: ${product.title}` });
      }
    }

    // Calculate order totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.furniture.price * item.quantity;
    });

    // Default tax rate (can be made configurable)
    const taxRate = 0.1; // 10%
    const tax = subtotal * taxRate;

    // Get delivery fee from request or set default
    const deliveryFee = req.body.deliveryFee || 0;

    // Calculate total
    const total = subtotal + tax + deliveryFee;

    // Create the order
    const order = await Order.create({
      userId,
      status: 'pending',
      total,
      subtotal,
      tax,
      deliveryFee,
      deliveryAddress: userData?.address || req.user.address,
      paymentMethod: paymentMethod,
      paymentStatus: 'pending',
      notes: userData?.notes || ''
    }, { transaction });

    // Create order items and update stock
    for (const item of items) {
      await OrderProduct.create({
        orderId: order.id,
        productId: item.furnitureId,
        quantity: item.quantity,
        unitPrice: item.furniture.price,
        totalPrice: item.furniture.price * item.quantity
      }, { transaction });

      // Update product stock
      const product = await Product.findByPk(item.furnitureId, { transaction });
      if (product && product.stockQuantity !== null) {
        product.stockQuantity -= item.quantity;
        if (product.stockQuantity <= 0) {
          product.inStock = false;
        }
        await product.save({ transaction });
      }
    }

    // Remove only the ordered items from the user's cart
    const cartItemIds = items.map(item => item.furnitureId);
    await Cart.destroy({ where: { userId, furnitureId: cartItemIds }, transaction });

    // Commit transaction
    await transaction.commit();

    // Return the created order with products
    const newOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            model: OrderProduct,
            as: 'orderDetails',
            attributes: ['quantity', 'unitPrice', 'totalPrice']
          }
        }
      ]
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Initiate payment for an order
exports.initiatePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, paymentMethod = 'chapa' } = req.body;

    // Find the order
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Update payment method
    order.paymentMethod = paymentMethod;
    await order.save();

    // Redirect to appropriate payment controller based on method
    if (paymentMethod === 'chapa') {
      // Forward to Chapa payment controller
      const chapaController = require('../payment/chapaController');
      return chapaController.initializePayment(req, res);
    } else if (paymentMethod === 'cash_on_delivery') {
      // Handle cash on delivery
      order.paymentMethod = 'cash_on_delivery';
      order.status = 'confirmed';
      await order.save();

      return res.json({
        message: 'Order confirmed for cash on delivery',
        order: {
          id: order.id,
          status: order.status,
          paymentMethod: order.paymentMethod
        }
      });
    } else {
      return res.status(400).json({ message: 'Unsupported payment method' });
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Track an order
exports.trackOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: {
        id,
        userId
      },
      attributes: ['id', 'status', 'createdAt', 'deliveryDate', 'deliveryAddress']
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create tracking information
    const trackingInfo = {
      orderId: order.id,
      status: order.status,
      orderDate: order.createdAt,
      estimatedDelivery: order.deliveryDate,
      deliveryAddress: order.deliveryAddress,
      statusHistory: [
        {
          status: 'Order Placed',
          date: order.createdAt,
          completed: true
        },
        {
          status: 'Processing',
          date: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
            ? new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000) // 1 day after order
            : null,
          completed: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
        },
        {
          status: 'Shipped',
          date: order.status === 'shipped' || order.status === 'delivered'
            ? new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days after order
            : null,
          completed: order.status === 'shipped' || order.status === 'delivered'
        },
        {
          status: 'Delivered',
          date: order.status === 'delivered' ? order.deliveryDate : null,
          completed: order.status === 'delivered'
        }
      ]
    };

    res.json(trackingInfo);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
