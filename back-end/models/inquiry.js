'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inquiry extends Model {
    static associate(models) {
      // Inquiry belongs to a user
      Inquiry.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Inquiry belongs to a product
      Inquiry.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }
  
  Inquiry.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    preferredContactMethod: {
      type: DataTypes.ENUM('email', 'phone', 'both'),
      defaultValue: 'email'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'resolved'),
      defaultValue: 'pending'
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Inquiry',
    timestamps: true
  });
  
  return Inquiry;
};
