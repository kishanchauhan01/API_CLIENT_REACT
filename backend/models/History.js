const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const History = sequelize.define('History', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  duration: {
    type: DataTypes.STRING,
    defaultValue: '0ms',
  },
  responseBody: {
    type: DataTypes.TEXT,
    defaultValue: '',
    field: 'response_body',
  },
}, {
  tableName: 'history',
  timestamps: true,
  underscored: true,
});

module.exports = History;
