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

      // An elevator event belongs to an elevator
      ElevatorEvent.belongsTo(models.Elevator, {
        foreignKey: 'elevator_id',
        as: 'elevator'
      });
    }
  }
  ElevatorEvent.init({
    elevator_id: DataTypes.STRING,
    event_type: DataTypes.STRING,
    floor: DataTypes.INTEGER,
    metadata: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'ElevatorEvent',
    tableName: 'elevator_events',
    underscored: true,
  });
  return ElevatorEvent;
};