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
    elevator_id: DataTypes.STRING,
    call_id: DataTypes.STRING,
    floor: DataTypes.INTEGER,
    queue_type: DataTypes.STRING,
    priority: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ElevatorQueue',
    tableName: 'elevator_queues',
    underscored: true,
  });
  return ElevatorQueue;
};