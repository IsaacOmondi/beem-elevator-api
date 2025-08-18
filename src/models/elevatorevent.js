'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ElevatorEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ElevatorEvent.init({
    elevatorId: DataTypes.STRING,
    eventType: DataTypes.STRING,
    floor: DataTypes.INTEGER,
    metadata: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'ElevatorEvent',
  });
  return ElevatorEvent;
};