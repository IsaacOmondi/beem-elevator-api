'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('elevator_queues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      elevator_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'elevators',
          key: 'id'
        },
        allowNull: false
      },
      call_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'elevator_calls',
          key: 'id'
        },
        allowNull: false
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      queue_type: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('elevator_queues');
  }
};