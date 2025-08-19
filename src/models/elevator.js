'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Elevator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // An elevator belongs to a building
      Elevator.belongsTo(models.Building, {
        foreignKey: 'building_id',
        as: 'building'
      });
      
      // An elevator has many calls
      Elevator.hasMany(models.ElevatorCall, {
        foreignKey: 'elevator_id',
        as: 'elevator_call'
      });
      
      // An elevator has many events
      Elevator.hasMany(models.ElevatorEvent, {
        foreignKey: 'elevator_id',
        as: 'elevator_event'
      });
      
      // An elevator has many queue items
      Elevator.hasMany(models.ElevatorQueue, {
        foreignKey: 'elevator_id',
        as: 'elevator_queue'
      });
    }
  }
  Elevator.init({
    building_id: DataTypes.STRING,
    name: DataTypes.STRING,
    current_floor: DataTypes.INTEGER,
    target_floor: DataTypes.INTEGER,
    state: DataTypes.ENUM(['idle', 'moving_up', 'moving_down', 'doors_opening', 'doors_closing']),
    direction: DataTypes.ENUM(['up', 'down', 'stationary']),
    door_state: DataTypes.ENUM(['open', 'closed', 'opening', 'closing']),
  }, {
    sequelize,
    modelName: 'Elevator',
    tableName: 'elevators',
    underscored: true,
  });
  return Elevator;
};