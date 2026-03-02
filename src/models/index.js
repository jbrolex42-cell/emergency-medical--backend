const { sequelize } = require("../config/database");
const User = require("./User");
const EmergencyRequest = require("./EmergencyRequest");
const Subscription = require("./Subscription");
const Provider = require("./Provider");
const Vehicle = require("./Vehicle");
const ResponseUnit = require("./ResponseUnit");

User.hasMany(EmergencyRequest, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

EmergencyRequest.belongsTo(User, {
  foreignKey: "userId"
});

User.hasOne(Subscription, {
  foreignKey: "userId",
  onDelete: "CASCADE"
});

Subscription.belongsTo(User, {
  foreignKey: "userId"
});



Provider.hasMany(Vehicle, {
  foreignKey: "providerId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE"
});

Vehicle.belongsTo(Provider, {
  foreignKey: "providerId"
});

Provider.hasMany(ResponseUnit, {
  foreignKey: "providerId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE"
});

ResponseUnit.belongsTo(Provider, {
  foreignKey: "providerId"
});

EmergencyRequest.belongsTo(Provider, {
  foreignKey: "assignedProviderId"
});

EmergencyRequest.belongsTo(Vehicle, {
  foreignKey: "assignedVehicleId"
});

EmergencyRequest.belongsTo(ResponseUnit, {
  foreignKey: "assignedResponseUnitId"
});

module.exports = {
  sequelize,
  User,
  EmergencyRequest,
  Subscription,
  Provider,
  Vehicle,
  ResponseUnit
};