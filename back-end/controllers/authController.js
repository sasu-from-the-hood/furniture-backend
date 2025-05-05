const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, AdminRole } = require('../models');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      roleId: null
    });
    
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with any role
    const user = await User.findOne({
      where: { email },
      include: [{
        model: AdminRole,
        as: 'role',
        required: false
      }]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Determine user type and permissions
    let userType = 'customer';
    let permissions = null;
    
    if (user.role) {
      userType = user.role.roleName;
      permissions = user.role.permissions;
    }
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        userType,
        role: user.role ? user.role.roleName : null,
        permissions,
        isAdmin: !!user.roleId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: AdminRole,
        as: 'role',
        required: false
      }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Determine user type and permissions
    let userType = 'customer';
    let permissions = null;
    
    if (user.role) {
      userType = user.role.roleName;
      permissions = user.role.permissions;
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        userType,
        role: user.role ? user.role.roleName : null,
        permissions,
        isAdmin: !!user.roleId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
