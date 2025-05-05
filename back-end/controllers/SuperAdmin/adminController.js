const bcrypt = require('bcryptjs');
const { User, AdminRole } = require('../../models');

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: {
        roleId: { [require('sequelize').Op.not]: null }
      },
      attributes: { exclude: ['password'] },
      include: [{
        model: AdminRole,
        as: 'role'
      }]
    });
    
    res.json({
      admins: admins.map(admin => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        address: admin.address,
        isActive: admin.isActive,
        role: admin.role ? admin.role.roleName : null,
        roleId: admin.roleId,
        createdAt: admin.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const admin = await User.findOne({
      where: { 
        id,
        roleId: { [require('sequelize').Op.not]: null }
      },
      attributes: { exclude: ['password'] },
      include: [{
        model: AdminRole,
        as: 'role'
      }]
    });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        address: admin.address,
        isActive: admin.isActive,
        role: admin.role ? admin.role.roleName : null,
        roleId: admin.roleId,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, address, roleId } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    const role = await AdminRole.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      roleId,
      isActive: true
    });
    
    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: role.roleName,
        roleId: admin.roleId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, roleId, isActive } = req.body;
    
    const admin = await User.findOne({
      where: { 
        id,
        roleId: { [require('sequelize').Op.not]: null }
      }
    });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    if (email !== admin.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    if (roleId) {
      const role = await AdminRole.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }
    }
    
    await admin.update({
      name: name || admin.name,
      email: email || admin.email,
      phone: phone !== undefined ? phone : admin.phone,
      address: address !== undefined ? address : admin.address,
      roleId: roleId || admin.roleId,
      isActive: isActive !== undefined ? isActive : admin.isActive
    });
    
    const updatedAdmin = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: AdminRole,
        as: 'role'
      }]
    });
    
    res.json({
      message: 'Admin updated successfully',
      admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        phone: updatedAdmin.phone,
        address: updatedAdmin.address,
        isActive: updatedAdmin.isActive,
        role: updatedAdmin.role ? updatedAdmin.role.roleName : null,
        roleId: updatedAdmin.roleId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const admin = await User.findOne({
      where: { 
        id,
        roleId: { [require('sequelize').Op.not]: null }
      }
    });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await admin.update({
      password: hashedPassword
    });
    
    res.json({
      message: 'Admin password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const admin = await User.findOne({
      where: { 
        id,
        roleId: { [require('sequelize').Op.not]: null }
      }
    });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Check if this is the last Super Admin
    if (admin.roleId === 1) { // Assuming 1 is the Super Admin role ID
      const superAdminCount = await User.count({
        where: { roleId: 1 }
      });
      
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last Super Admin' });
      }
    }
    
    await admin.destroy();
    
    res.json({
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await AdminRole.findAll();
    
    res.json({
      roles: roles.map(role => ({
        id: role.id,
        name: role.roleName,
        description: role.description,
        permissions: role.permissions
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
