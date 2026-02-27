const sequelize = require('../config/database');
const User = require('./User');
const Collection = require('./Collection');
const Request = require('./Request');
const Environment = require('./Environment');
const Variable = require('./Variable');
const History = require('./History');

// ─── Associations ─────────────────────────────────────────────

// Collection belongs to User; User has many Collections
User.hasMany(Collection, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Collection.belongsTo(User, { foreignKey: 'user_id' });

// Request belongs to Collection; Collection has many Requests
Collection.hasMany(Request, { foreignKey: 'collection_id', as: 'requests', onDelete: 'CASCADE' });
Request.belongsTo(Collection, { foreignKey: 'collection_id' });

// Environment belongs to User; User has many Environments
User.hasMany(Environment, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Environment.belongsTo(User, { foreignKey: 'user_id' });

// Variable belongs to Environment; Environment has many Variables
Environment.hasMany(Variable, { foreignKey: 'environment_id', as: 'variables', onDelete: 'CASCADE' });
Variable.belongsTo(Environment, { foreignKey: 'environment_id' });

// History belongs to User; User has many History entries
User.hasMany(History, { foreignKey: 'user_id', onDelete: 'CASCADE' });
History.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Collection,
  Request,
  Environment,
  Variable,
  History,
};
