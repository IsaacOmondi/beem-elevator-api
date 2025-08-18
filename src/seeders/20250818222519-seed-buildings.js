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
   await queryInterface.bulkInsert('Buildings', [
    {
      id: 'building-1',
      name: 'West Park Towers',
      totalFloors: 13,
      floorTravelTimeSeconds: 5,
      doorOperationTimeSeconds: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'building-2',
      name: 'The Oval',
      totalFloors: 5,
      floorTravelTimeSeconds: 3,
      doorOperationTimeSeconds: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 'building-3',
      name: 'Sarit Center',
      totalFloors: 10,
      floorTravelTimeSeconds: 4,
      doorOperationTimeSeconds: 2,
      createdAt: new Date(),
      updatedAt: new Date()
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
