'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('elevator_calls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      building_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'buildings',
          key: 'id'
        },
        allowNull: false
      },
      elevator_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'elevators',
          key: 'id'
        },
        allowNull: false
      },
      from_floor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      to_floor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      completed_at: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('elevator_calls');
  }
};