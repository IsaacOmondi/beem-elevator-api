'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sql_query_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      query_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      parameters: {
        type: Sequelize.JSON
      },
      execution_time_ms: {
        type: Sequelize.INTEGER
      },
      rows_returned: {
        type: Sequelize.INTEGER
      },
      caller_info: {
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
    await queryInterface.dropTable('sql_query_logs');
  }
};