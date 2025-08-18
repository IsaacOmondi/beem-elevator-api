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
   await queryInterface.bulkInsert('Elevators', [
      // West Park Towers elevators
      {
        id: 'elevator-1',
        buildingId: 'building-1',
        name: 'Elevator A',
        currentFloor: 1,
        targetFloor: null,
        state: 'idle',
        direction: 'stationary',
        doorState: 'closed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'elevator-2',
        buildingId: 'building-1',
        name: 'Elevator B',
        currentFloor: 5,
        targetFloor: null,
        state: 'idle',
        direction: 'stationary',
        doorState: 'closed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'elevator-3',
        buildingId: 'building-1',
        name: 'Elevator C',
        currentFloor: 10,
        targetFloor: null,
        state: 'idle',
        direction: 'stationary',
        doorState: 'closed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // The Oval elevators
      {
        id: 'elevator-4',
        buildingId: 'building-2',
        name: 'Express Elevator',
        currentFloor: 1,
        targetFloor: null,
        state: 'idle',
        direction: 'stationary',
        doorState: 'closed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'elevator-5',
        buildingId: 'building-2',
        name: 'Local Elevator',
        currentFloor: 8,
        targetFloor: null,
        state: 'idle',
        direction: 'stationary',
        doorState: 'closed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Sarit Center elevators
      {
        id: 'elevator-6',
        buildingId: 'building-3',
        name: 'Main Elevator',
        currentFloor: 1,
        targetFloor: null,
        state: 'idle',
        direction: 'stationary',
        doorState: 'closed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'elevator-7',
        buildingId: 'building-3',
        name: 'Service Elevator',
        currentFloor: 3,
        targetFloor: null,
        state: 'maintenance',
        direction: 'stationary',
        doorState: 'closed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Elevators', null, {});
  }
};
