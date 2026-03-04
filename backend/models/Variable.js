const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Variable = sequelize.define('Variable', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  environmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'environment_id',
  },
  key: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  value: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  secret: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'variables',
  timestamps: false,
  underscored: true,
});

module.exports = Variable;
