'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Elevators', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      buildingId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: {
          model: 'Buildings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100)
      },
      currentFloor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      targetFloor: {
        type: Sequelize.INTEGER
      },
      state: {
        type: Sequelize.ENUM('idle', 'moving_up', 'moving_down', 'doors_opening', 'doors_closing', 'maintenance'),
        allowNull: false,
        defaultValue: 'idle'
      },
      direction: {
        type: Sequelize.ENUM('up', 'down', 'stationary'),
        allowNull: false,
        defaultValue: 'stationary'
      },
      doorState: {
        type: Sequelize.ENUM('open', 'closed', 'opening', 'closing'),
        allowNull: false,
        defaultValue: 'closed'
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
    await queryInterface.dropTable('Elevators');
  }
};