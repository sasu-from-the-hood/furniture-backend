const { User, AdminRole, Order, Review, sequelize } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Get all users with pagination and sorting
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, perPage = 10, sortField = 'createdAt', sortOrder = 'DESC', q = '' } = req.query;

    // Calculate offset for pagination
    const offset = (page - 1) * perPage;

    // Build search condition
    const searchCondition = q
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } },
            { phone: { [Op.like]: `%${q}%` } }
          ]
        }
      : {};

    // Get total count for pagination
    const total = await User.count({
      where: searchCondition
    });

    // Get users with pagination, sorting, and search
    const users = await User.findAll({
      where: searchCondition,
      include: [
        {
          model: AdminRole,
          as: 'role',
          attributes: ['roleName']
        }
      ],
      order: [[sortField, sortOrder]],
      limit: parseInt(perPage),
      offset: parseInt(offset)
    });

    // Format users for response
    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      return {
        ...userData,
        role: userData.role ? userData.role.name : 'Customer',
        // Don't send password in response
        password: undefined
      };
    });

    // Send response with pagination info
    res.json({
      data: formattedUsers,
      total,
      page: parseInt(page),
      perPage: parseInt(perPage)
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
    include: [
        {
          model: AdminRole,
          as: 'role',
          attributes: ['rolename']
        },
        {
          model: Order,
          as: 'orders'
        },
        {
          model: Review,
          as: 'reviews'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.toJSON();

    res.json(userData);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, roleId, isActive = true } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // If roleId is provided, check if it's valid
    if (roleId) {
      const role = await AdminRole.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      roleId: roleId || null,
      isActive
    });

    // Get role name if roleId is provided
    let roleName = 'Regular User';
    if (roleId) {
      const role = await AdminRole.findByPk(roleId);
      roleName = role ? role.roleName : 'Regular User';
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: roleName,
        roleId: user.roleId,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, roleId, isActive } = req.body;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If email is being changed, check if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // If roleId is provided, check if it's valid
    if (roleId !== undefined) {
      if (roleId !== null) {
        const role = await AdminRole.findByPk(roleId);
        if (!role) {
          return res.status(400).json({ message: 'Invalid role ID' });
        }
      }
    }

    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone !== undefined ? phone : user.phone,
      address: address !== undefined ? address : user.address,
      roleId: roleId !== undefined ? roleId : user.roleId,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    // Get updated user with role
    const updatedUser = await User.findByPk(id, {
      include: [{
        model: AdminRole,
        as: 'role'
      }]
    });

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role ? updatedUser.role.roleName : 'Regular User',
        roleId: updatedUser.roleId,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user password
exports.updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword
    });

    res.json({
      message: 'User password updated successfully'
    });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if this is a Super Admin
    if (user.roleId === 1) { // Assuming 1 is the Super Admin role ID
      const superAdminCount = await User.count({
        where: { roleId: 1 }
      });

      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last Super Admin' });
      }
    }

    await user.destroy();

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get multiple users by IDs
exports.getManyUsers = async (req, res) => {
  try {
    // Get IDs from query parameter
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    // Parse the comma-separated IDs
    const userIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (userIds.length === 0) {
      return res.status(400).json({ message: 'Invalid user IDs format' });
    }

    // Find users by IDs
    const users = await User.findAll({
      where: {
        id: {
          [Op.in]: userIds
        }
      },
      include: [
        {
          model: AdminRole,
          as: 'role',
          attributes: ['roleName']
        }
      ]
    });

    // Format users for response
    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      return {
        ...userData,
        role: userData.role ? userData.role.roleName : 'Customer',
        // Don't send password in response
        password: undefined
      };
    });

    // Return users array
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error getting multiple users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const transaction = await sequelize.transaction();

    try {
      // Get total users count
      const totalUsers = await User.count({ transaction });

      // Get active users count
      const activeUsers = await User.count({
        where: { isActive: true },
        transaction
      });

      // Get users registered in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newUsers = await User.count({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        transaction
      });

      // Get users by role
      const usersByRole = await User.findAll({
        attributes: [
          [sequelize.literal('COALESCE(role.name, "Customer")'), 'role'],
          [sequelize.fn('COUNT', sequelize.col('User.id')), 'count']
        ],
        include: [
          {
            model: AdminRole,
            as: 'role',
            attributes: []
          }
        ],
        group: [sequelize.literal('COALESCE(role.name, "Customer")')],
        transaction
      });

      await transaction.commit();

      res.json({
        totalUsers,
        activeUsers,
        newUsers,
        usersByRole: usersByRole.map(item => ({
          role: item.getDataValue('role'),
          count: parseInt(item.getDataValue('count'))
        }))
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
