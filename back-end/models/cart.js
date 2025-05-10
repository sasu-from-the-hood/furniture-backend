'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      // Cart belongs to a user
      Cart.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Cart belongs to a product (furniture)
      Cart.belongsTo(models.Product, {
        foreignKey: 'furnitureId',
        as: 'furniture'
      });
    }
  }
  
  Cart.init({
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
    furnitureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    }
  }, {
    sequelize,
    modelName: 'Cart',
    timestamps: true
  });
  
  return Cart;
};
