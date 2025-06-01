'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Products', 'products_ibfk_1');
    await queryInterface.addConstraint('Products', {
      fields: ['categoryId'],
      type: 'foreign key',
      name: 'products_ibfk_1',
      references: {
        table: 'Categories',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Products', 'products_ibfk_1');
    await queryInterface.addConstraint('Products', {
      fields: ['categoryId'],
      type: 'foreign key',
      name: 'products_ibfk_1',
      references: {
        table: 'Categories',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  }
};