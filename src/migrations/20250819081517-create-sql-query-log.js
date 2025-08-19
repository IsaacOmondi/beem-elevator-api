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
      sql_query: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      request_path: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index for performance
    await queryInterface.addIndex('sql_query_logs', ['created_at']);
    await queryInterface.addIndex('sql_query_logs', ['request_path']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sql_query_logs');
  }
};