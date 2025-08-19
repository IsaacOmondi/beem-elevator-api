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

      // A queue item belongs to an elevator
      ElevatorQueue.belongsTo(models.Elevator, {
        foreignKey: 'elevator_id',
        as: 'elevator'
      });
      
      // A queue item belongs to an elevator call
      ElevatorQueue.belongsTo(models.ElevatorCall, {
        foreignKey: 'call_id',
        as: 'call'
      });
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