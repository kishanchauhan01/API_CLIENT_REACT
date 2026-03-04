const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Environment = sequelize.define('Environment', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'environments',
  timestamps: true,
  underscored: true,
});

module.exports = Environment;
