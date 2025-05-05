'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Order belongs to a user
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Order can have many products
      Order.belongsToMany(models.Product, {
        through: 'OrderProduct',
        as: 'products',
        foreignKey: 'orderId'
      });

      // Order can have one invoice
      Order.hasOne(models.Invoice, {
        foreignKey: 'orderId',
        as: 'invoice'
      });
    }
  }

  Order.init({
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
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending'
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    installationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    installationRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    installationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isQuote: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    quoteExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
    timestamps: true,
    paranoid: true // Enable soft deletes
  });

  return Order;
};
