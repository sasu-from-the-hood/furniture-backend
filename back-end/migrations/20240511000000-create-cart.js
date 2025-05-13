'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the Users and Products tables exist
    try {
      await queryInterface.describeTable('Users');
      await queryInterface.describeTable('Products');
    } catch (error) {
      console.error('Error: Users or Products table does not exist. Please run the create-tables migration first.');
      throw new Error('Foreign key tables do not exist');
    }

    await queryInterface.createTable('Carts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      furnitureId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Carts');
  }
};
