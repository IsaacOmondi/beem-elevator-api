'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SqlQueryLogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SqlQueryLogs.init({
    query_text: DataTypes.TEXT,
    parameters: DataTypes.JSON,
    execution_time_ms: DataTypes.INTEGER,
    rows_returned: DataTypes.INTEGER,
    caller_info: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'SqlQueryLogs',
    tableName: 'sql_query_logs',
    underscored: true,
  });
  return SqlQueryLogs;
};