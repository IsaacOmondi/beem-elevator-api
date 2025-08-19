'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('buildings', [
    {
      name: 'West Park Towers',
      total_floors: 13,
      floor_travel_time_seconds: 5,
      door_operation_time_seconds: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'The Oval',
      total_floors: 5,
      floor_travel_time_seconds: 3,
      door_operation_time_seconds: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'Sarit Center',
      total_floors: 10,
      floor_travel_time_seconds: 4,
      door_operation_time_seconds: 2,
      created_at: new Date(),
      updated_at: new Date()
    }
   ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Buildings', null, {});
  }
};
