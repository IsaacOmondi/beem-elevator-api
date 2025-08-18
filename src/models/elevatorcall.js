'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ElevatorCall extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ElevatorCall.init({
    buildingId: DataTypes.STRING,
    elevatorId: DataTypes.STRING,
    fromFloor: DataTypes.INTEGER,
    toFloor: DataTypes.INTEGER,
    status: DataTypes.STRING,
    completedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ElevatorCall',
  });
  return ElevatorCall;
};