const { Cart, Product, ProductImage, User } = require('../../models');
const { Op } = require('sequelize');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'furniture',
          include: [
            {
              model: ProductImage,
              as: 'images'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { furnitureId, quantity } = req.body;
    
    if (!furnitureId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
    
    // Check if product exists
    const product = await Product.findByPk(furnitureId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({
      where: {
        userId,
        furnitureId
      }
    });
    
    if (existingCartItem) {
      // Update quantity if item already exists
      existingCartItem.quantity += parseInt(quantity);
      await existingCartItem.save();
      
      res.status(200).json({
        message: 'Cart updated successfully',
        cartItem: existingCartItem
      });
    } else {
      // Create new cart item
      const cartItem = await Cart.create({
        userId,
        furnitureId,
        quantity: parseInt(quantity)
      });
      
      const newCartItem = await Cart.findByPk(cartItem.id, {
        include: [
          {
            model: Product,
            as: 'furniture',
            include: [
              {
                model: ProductImage,
                as: 'images'
              }
            ]
          }
        ]
      });
      
      res.status(201).json({
        message: 'Item added to cart successfully',
        cartItem: newCartItem
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    const cartItem = await Cart.findOne({
      where: {
        id,
        userId
      }
    });
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    cartItem.quantity = parseInt(quantity);
    await cartItem.save();
    
    res.json({
      message: 'Cart item updated successfully',
      cartItem
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const cartItem = await Cart.findOne({
      where: {
        id,
        userId
      }
    });
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    await cartItem.destroy();
    
    res.json({
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Cart.destroy({
      where: { userId }
    });
    
    res.json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
