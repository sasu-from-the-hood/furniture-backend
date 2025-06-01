'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Product belongs to a category
      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });

      // Product can have many images
      Product.hasMany(models.ProductImage, {
        foreignKey: 'productId',
        as: 'images'
      });

      // Product can have many reviews
      Product.hasMany(models.Review, {
        foreignKey: 'productId',
        as: 'reviews'
      });

      // Product can have many inquiries
      Product.hasMany(models.Inquiry, {
        foreignKey: 'productId',
        as: 'inquiries'
      });

      // Product can be in many orders
      Product.belongsToMany(models.Order, {
        through: 'OrderProduct',
        as: 'orders',
        foreignKey: 'productId'
      });

      // Product can be in many wishlists
      Product.belongsToMany(models.User, {
        through: 'UserWishlist',
        as: 'wishlistedBy',
        foreignKey: 'productId'
      });

      // Product has many OrderProducts
      Product.hasMany(models.OrderProduct, {
        foreignKey: 'productId',
        as: 'orderProducts'
      });
    }
  }

  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shortDesc: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    longDesc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    inStock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    installationAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    installationDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    material: {
      type: DataTypes.STRING,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        length: null,
        width: null,
        height: null,
        weight: null
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Product',
    timestamps: true,
    paranoid: true // Enable soft deletes
  });

  return Product;
};
