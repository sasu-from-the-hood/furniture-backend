'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add deletedAt column to Products table
    await queryInterface.addColumn('Products', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    // Add deletedAt column to Orders table
    await queryInterface.addColumn('Orders', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    // Add deletedAt column to OrderProducts table
    await queryInterface.addColumn('OrderProducts', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    // Add deletedAt column to Invoices table
    await queryInterface.addColumn('Invoices', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove deletedAt column from Products table
    await queryInterface.removeColumn('Products', 'deletedAt');
    
    // Remove deletedAt column from Orders table
    await queryInterface.removeColumn('Orders', 'deletedAt');
    
    // Remove deletedAt column from OrderProducts table
    await queryInterface.removeColumn('OrderProducts', 'deletedAt');
    
    // Remove deletedAt column from Invoices table
    await queryInterface.removeColumn('Invoices', 'deletedAt');
  }
};
