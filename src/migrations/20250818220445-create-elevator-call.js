'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ElevatorCalls', {
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
      },
      elevatorId: {
        type: Sequelize.STRING(50),
        references: {
          model: 'Elevators',
          key: 'id'
        }
      },
      fromFloor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      toFloor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      completedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ElevatorCalls');
  }
};