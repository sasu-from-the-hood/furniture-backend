const jwt = require('jsonwebtoken');
const { User, AdminRole } = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      include: [{
        model: AdminRole,
        as: 'role'
      }]
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.user.roleId) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

exports.hasRole = (roleName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findByPk(req.user.id, {
        include: [{
          model: AdminRole,
          as: 'role'
        }]
      });

      if (!user || !user.role || user.role.roleName !== roleName) {
        return res.status(403).json({ message: `${roleName} role required` });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};

exports.hasPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user.role) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const permissions = JSON.parse(req.user.role.permissions);

    if (!permissions[resource] || !permissions[resource].includes(action)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};
