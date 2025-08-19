'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Building extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Building.init({
    name: DataTypes.STRING,
    total_floors: DataTypes.INTEGER,
    floor_travel_time_seconds: DataTypes.INTEGER,
    door_operation_time_seconds: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Building',
    tableName: 'buildings',
    underscored: true,
  });
  return Building;
};