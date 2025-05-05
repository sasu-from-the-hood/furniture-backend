'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {
      // No associations
    }
  }
  
  Setting.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('text', 'html', 'json', 'boolean', 'number', 'image'),
      defaultValue: 'text'
    },
    group: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'general'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Setting',
    timestamps: true
  });
  
  return Setting;
};
