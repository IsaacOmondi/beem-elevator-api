'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('elevators', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      building_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'buildings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100)
      },
      current_floor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      target_floor: {
        type: Sequelize.INTEGER
      },
      state: {
        type: Sequelize.ENUM('idle', 'moving_up', 'moving_down', 'doors_opening', 'doors_closing'),
        allowNull: false,
        defaultValue: 'idle'
      },
      direction: {
        type: Sequelize.ENUM('up', 'down', 'stationary'),
        allowNull: false,
        defaultValue: 'stationary'
      },
      door_state: {
        type: Sequelize.ENUM('open', 'closed', 'opening', 'closing'),
        allowNull: false,
        defaultValue: 'closed'
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
    await queryInterface.dropTable('elevators');
  }
};