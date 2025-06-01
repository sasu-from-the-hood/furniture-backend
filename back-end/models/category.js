'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Category can have many products
      // Adding onDelete: 'CASCADE' to allow deletion of categories with products
      Category.hasMany(models.Product, {
        foreignKey: 'categoryId',
        as: 'products',
        onDelete: 'CASCADE'
      });
      
      // Categories can have parent categories (for subcategories)
      Category.belongsTo(Category, {
        foreignKey: 'parentId',
        as: 'parent'
      });
      
      // Adding onDelete: 'CASCADE' to automatically delete subcategories when parent is deleted
      Category.hasMany(Category, {
        foreignKey: 'parentId',
        as: 'subcategories',
        onDelete: 'CASCADE'
      });
    }
  }
  
  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    filters: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        material: [],
        color: [],
        priceRange: {
          min: null,
          max: null
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Category',
    timestamps: true
  });
  
  return Category;
};