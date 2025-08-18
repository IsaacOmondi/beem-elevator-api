'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SqlQueryLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SqlQueryLog.init({
    queryText: DataTypes.TEXT,
    parameters: DataTypes.JSON,
    executionTimeMs: DataTypes.INTEGER,
    rowsReturned: DataTypes.INTEGER,
    callerInfo: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'SqlQueryLog',
  });
  return SqlQueryLog;
};