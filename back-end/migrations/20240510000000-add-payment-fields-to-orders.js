'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'transactionRef', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'quoteExpiryDate'
    });

    await queryInterface.addColumn('Orders', 'paymentId', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'transactionRef'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'transactionRef');
    await queryInterface.removeColumn('Orders', 'paymentId');
  }
};
