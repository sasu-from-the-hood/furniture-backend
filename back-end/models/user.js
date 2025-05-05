'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User can have many orders
      User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders'
      });
      
      // User can have many reviews
      User.hasMany(models.Review, {
        foreignKey: 'userId',
        as: 'reviews'
      });
      
      // User can have many inquiries
      User.hasMany(models.Inquiry, {
        foreignKey: 'userId',
        as: 'inquiries'
      });
      
      // User can have a role
      User.belongsTo(models.AdminRole, {
        foreignKey: 'roleId',
        as: 'role'
      });
      
      // User can have many wishlist items (products)
      User.belongsToMany(models.Product, {
        through: 'UserWishlist',
        as: 'wishlistItems',
        foreignKey: 'userId'
      });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null // Regular users don't have admin roles
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true
  });
  
  return User;
};
