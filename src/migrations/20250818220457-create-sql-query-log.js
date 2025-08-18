'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SqlQueryLogs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      queryText: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      parameters: {
        type: Sequelize.JSON
      },
      executionTimeMs: {
        type: Sequelize.INTEGER
      },
      rowsReturned: {
        type: Sequelize.INTEGER
      },
      callerInfo: {
        type: Sequelize.JSON
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
    await queryInterface.dropTable('SqlQueryLogs');
  }
};