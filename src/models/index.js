const { sequelize } = require('../config/database');
const User = require('./User');
const EmergencyRequest = require('./EmergencyRequest');
const Subscription = require('./Subscription');
const Provider = require('./Provider');
const Vehicle = require('./Vehicle');
const ResponseUnit = require('./ResponseUnit');

// Define associations
User.hasMany(EmergencyRequest, { foreignKey: 'userId' });
EmergencyRequest.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Subscription, { foreignKey: 'userId' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

Provider.hasMany(Vehicle, { foreignKey: 'providerId' });
Vehicle.belongsTo(Provider, { foreignKey: 'providerId' });

Provider.hasMany(ResponseUnit, { foreignKey: 'providerId' });
ResponseUnit.belongsTo(Provider, { foreignKey: 'providerId' });

EmergencyRequest.belongsTo(Provider, { foreignKey: 'assignedProviderId' });
EmergencyRequest.belongsTo(Vehicle, { foreignKey: 'assignedVehicleId' });
EmergencyRequest.belongsTo(ResponseUnit, { foreignKey: 'assignedResponseUnitId' });

module.exports = {
  sequelize,
  User,
  EmergencyRequest,
  Subscription,
  Provider,
  Vehicle,
  ResponseUnit
};