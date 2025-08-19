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
    building_id: DataTypes.STRING,
    name: DataTypes.STRING,
    current_floor: DataTypes.INTEGER,
    target_floor: DataTypes.INTEGER,
    state: DataTypes.ENUM,
    direction: DataTypes.ENUM,
    door_state: DataTypes.ENUM
  }, {
    sequelize,
    modelName: 'Elevator',
    tableName: 'elevators',
    underscored: true,
  });
  return Elevator;
};