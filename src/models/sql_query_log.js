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
    sql_query: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    request_path: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'SqlQueryLog',
    tableName: 'sql_query_logs',
    underscored: true,
  });
  return SqlQueryLog;
};