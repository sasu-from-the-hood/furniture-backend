'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdminRole extends Model {
    static associate(models) {
      // AdminRole can have many users
      AdminRole.hasMany(models.User, {
        foreignKey: 'roleId',
        as: 'users'
      });
    }
  }
  
  AdminRole.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    roleName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'AdminRole',
    timestamps: true
  });
  
  return AdminRole;
};
