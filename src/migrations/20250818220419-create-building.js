'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Buildings', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      name: {
        type: Sequelize.STRING(100)
      },
      totalFloors: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      floorTravelTimeSeconds: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      doorOperationTimeSeconds: {
        type: Sequelize.INTEGER,
        defaultValue: 2
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
    await queryInterface.dropTable('Buildings');
  }
};