const axios = require('axios');
const { Order, User, Product, OrderProduct } = require('../../models');
const { v4: uuidv4 } = require('uuid');

// Chapa API configuration
const CHAPA_API_URL =  'https://api.chapa.co';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CALLBACK_URL = process.env.CALLBACK_URL

/**
 * Initialize payment with Chapa
 */
exports.initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

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

    // Get user information
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique transaction reference
    const tx_ref = `ORDER-${order.id}-${uuidv4().substring(0, 8)}`;

    // Save the transaction reference to the order
    order.transactionRef = tx_ref;
    await order.save();

    // Prepare the payment payload
    const paymentData = {
      amount: order.total,
      currency: 'ETB',
      first_name: user.name.split(' ')[0],
      last_name: user.name.split(' ').slice(1).join(' ') || 'Customer',
      tx_ref: tx_ref,
      callback_url: `${req.headers.origin}/api/payment/chapa/callback?order_id=${order.id}`,
      return_url: `${CALLBACK_URL}/orders/confirmation?tx_ref=${tx_ref}`,
      customization: {
        title: 'Payment',
        description: `Furniture Payment `,
      }
    };

    // Make request to Chapa API
    try {
      const response = await axios.post(`${CHAPA_API_URL}/v1/transaction/initialize`, paymentData, {
        headers: {
          'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Update order with payment information
      order.paymentMethod = 'chapa';
      order.paymentStatus = 'pending';
      await order.save();

      // Return the payment URL to the client
      res.json({
        message: 'Payment initialized successfully',
        checkoutUrl: response.data.data.checkout_url,
        transactionRef: tx_ref
      });
    } catch (error) {
      // Log and return the full Chapa error response
      console.error('Error initializing payment:', error.response?.data || error.message);
      res.status(500).json({
        message: 'Failed to initialize payment',
        chapaError: error.response?.data || error.message
      });
    }
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({
      message: 'Failed to initialize payment',
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * Verify payment status
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return res.status(400).json({
        message: 'Transaction reference is required',
        status: 'error'
      });
    }

    // Find the order by transaction reference
    const order = await Order.findOne({
      where: { transactionRef: tx_ref }
    });


    // Verify payment with Chapa
    try {
      const response = await axios.get(`${CHAPA_API_URL}/v1/transaction/verify/${tx_ref}`, {
        headers: {
          'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const paymentData = response.data.data;

      // If we have an order, update it based on payment status
      if (order) {
        if (paymentData.status === 'success') {
          order.paymentStatus = 'paid';
          order.status = 'confirmed';
          order.paymentId = paymentData.payment_id || '';
          await order.save();

          // Decrease stock for each product in the order
          const orderProducts = await OrderProduct.findAll({ where: { orderId: order.id } });
          for (const op of orderProducts) {
            const product = await Product.findByPk(op.productId);
            if (product && product.stockQuantity !== null && product.stockQuantity > 0) {
              product.stockQuantity -= op.quantity;
              if (product.stockQuantity < 0) product.stockQuantity = 0;
              await product.save();
            }
          }

          return res.json({
            message: 'Payment verified successfully',
            status: 'success',
            order: {
              id: order.id,
              status: order.status,
              paymentStatus: order.paymentStatus,
              total: order.total
            }
          });
        } else if (paymentData.status === 'pending') {
          // Handle pending payments
          return res.json({
            message: 'Payment is still processing',
            status: 'pending',
            order: {
              id: order.id,
              status: order.status,
              paymentStatus: order.paymentStatus,
              total: order.total
            }
          });
        } else {
          order.paymentStatus = 'failed';
          await order.save();

          return res.json({
            message: 'Payment verification failed',
            status: 'failed',
            order: {
              id: order.id,
              status: order.status,
              paymentStatus: order.paymentStatus,
              total: order.total
            }
          });
        }
      } else {
        // If we don't have an order but Chapa verification succeeded
        if (paymentData.status === 'success') {
          return res.json({
            message: 'Payment verified with Chapa, but order not found in system',
            status: 'success',
            chapaData: paymentData
          });
        } else {
          return res.json({
            message: 'Payment verification with Chapa incomplete, and order not found in system',
            status: paymentData.status,
            chapaData: paymentData
          });
        }
      }
    } catch (chapaError) {
      console.error('Error verifying with Chapa API:', chapaError);

      // If we have an order but Chapa verification failed
      if (order) {
        return res.status(502).json({
          message: 'Could not verify payment with payment provider',
          status: 'error',
          order: {
            id: order.id,
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: order.total
          }
        });
      } else {
        return res.status(502).json({
          message: 'Could not verify payment with payment provider and order not found',
          status: 'error',
          error: chapaError.response?.data?.message || chapaError.message
        });
      }
    }
  } catch (error) {
    console.error('Error in payment verification process:', error);
    res.status(500).json({
      message: 'Server error during payment verification',
      status: 'error',
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * Handle payment callback from Chapa
 */
exports.handleCallback = async (req, res) => {
  try {
    const { order_id } = req.query;
    const { status, tx_ref, payment_id } = req.body;

    // Find the order
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify that the transaction reference matches
    if (order.transactionRef !== tx_ref) {
      return res.status(400).json({ message: 'Invalid transaction reference' });
    }

    // Update order based on payment status
    if (status === 'success') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentId = payment_id || '';

      // Decrease stock for each product in the order
      const orderProducts = await OrderProduct.findAll({ where: { orderId: order.id } });
      for (const op of orderProducts) {
        const product = await Product.findByPk(op.productId);
        if (product && product.stockQuantity !== null && product.stockQuantity > 0) {
          product.stockQuantity -= op.quantity;
          if (product.stockQuantity < 0) product.stockQuantity = 0;
          await product.save();
        }
      }
    } else {
      order.paymentStatus = 'failed';
    }

    await order.save();

    // Return success response
    res.json({
      message: 'Callback processed successfully',
      status: status
    });
  } catch (error) {
    console.error('Error processing payment callback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
