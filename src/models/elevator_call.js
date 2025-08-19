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
      // An elevator call belongs to a building
      ElevatorCall.belongsTo(models.Building, {
        foreignKey: 'building_id',
        as: 'building'
      });
      
      // An elevator call belongs to an elevator
      ElevatorCall.belongsTo(models.Elevator, {
        foreignKey: 'elevator_id',
        as: 'elevator'
      });
      
      // An elevator call has many queue items
      ElevatorCall.hasMany(models.ElevatorQueue, {
        foreignKey: 'call_id',
        as: 'queueItems'
      });
    }
  }
  ElevatorCall.init({
    building_id: DataTypes.STRING,
    elevator_id: DataTypes.STRING,
    from_floor: DataTypes.INTEGER,
    to_floor: DataTypes.INTEGER,
    status: DataTypes.STRING,
    completed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ElevatorCall',
    tableName: 'elevator_calls',
    underscored: true,
  });
  return ElevatorCall;
};