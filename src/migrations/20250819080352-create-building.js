'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('buildings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      total_floors: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      floor_travel_time_seconds: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      door_operation_time_seconds: {
        type: Sequelize.INTEGER,
        defaultValue: 2
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
    await queryInterface.dropTable('buildings');
  }
};