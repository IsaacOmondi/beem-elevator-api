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
   await queryInterface.bulkInsert('elevators', [
      // West Park Towers elevators
      {
        building_id: 1,
        name: 'Elevator A',
        current_floor: 1,
        target_floor: null,
        state: 'idle',
        direction: 'stationary',
        door_state: 'closed',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        building_id: 1,
        name: 'Elevator B',
        current_floor: 5,
        target_floor: null,
        state: 'idle',
        direction: 'stationary',
        door_state: 'closed',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        building_id: 1,
        name: 'Elevator C',
        current_floor: 10,
        target_floor: null,
        state: 'idle',
        direction: 'stationary',
        door_state: 'closed',
        created_at: new Date(),
        updated_at: new Date()
      },
      // The Oval elevators
      {
        building_id: 2,
        name: 'Express Elevator',
        current_floor: 1,
        target_floor: null,
        state: 'idle',
        direction: 'stationary',
        door_state: 'closed',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        building_id: 2,
        name: 'Local Elevator',
        current_floor: 8,
        target_floor: null,
        state: 'idle',
        direction: 'stationary',
        door_state: 'closed',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Sarit Center elevators
      {
        building_id: 3,
        name: 'Main Elevator',
        current_floor: 1,
        target_floor: null,
        state: 'idle',
        direction: 'stationary',
        door_state: 'closed',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        building_id: 3,
        name: 'Side Elevator',
        current_floor: 5,
        target_floor: null,
        state: 'idle',
        direction: 'stationary',
        door_state: 'closed',
        created_at: new Date(),
        updated_at: new Date()
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
