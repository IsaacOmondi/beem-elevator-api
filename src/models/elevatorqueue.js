'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ElevatorQueue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ElevatorQueue.init({
    elevatorId: DataTypes.STRING,
    callId: DataTypes.STRING,
    floor: DataTypes.INTEGER,
    queueType: DataTypes.STRING,
    priority: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ElevatorQueue',
  });
  return ElevatorQueue;
};