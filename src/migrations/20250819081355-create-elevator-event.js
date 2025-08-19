'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('elevator_events', {
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
        }
      },
      event_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      floor: {
        type: Sequelize.INTEGER
      },
      metadata: {
        type: Sequelize.JSON
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
    await queryInterface.dropTable('elevator_events');
  }
};