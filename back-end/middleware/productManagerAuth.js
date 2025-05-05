const { User, AdminRole } = require('../models');

exports.isProductManager = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: AdminRole,
        as: 'role',
        where: { roleName: 'Product Manager' }
      }]
    });
    
    if (!user) {
      return res.status(403).json({ message: 'Product Manager access required' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
