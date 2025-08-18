'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ElevatorQueues', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      elevatorId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Elevators',
          key: 'id'
        }
      },
      callId: {
        type: Sequelize.STRING,
        references: {
          model: 'ElevatorCalls',
          key: 'id'
        }
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      queueType: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.dropTable('ElevatorQueues');
  }
};