'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Elevator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Elevator.init({
    buildingId: DataTypes.STRING,
    name: DataTypes.STRING,
    currentFloor: DataTypes.INTEGER,
    targetFloor: DataTypes.INTEGER,
    state: DataTypes.ENUM,
    direction: DataTypes.ENUM,
    doorState: DataTypes.ENUM
  }, {
    sequelize,
    modelName: 'Elevator',
  });
  return Elevator;
};