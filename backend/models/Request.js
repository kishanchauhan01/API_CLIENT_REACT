const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  collectionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'collection_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING,
    defaultValue: 'GET',
  },
  url: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'requests',
  timestamps: true,
  underscored: true,
});

module.exports = Request;
