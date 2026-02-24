const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  providerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'providers',
      key: 'id'
    }
  },
  registrationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('ambulance_basic', 'ambulance_advanced', 'motorcycle', '4x4', 'boat'),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Patient capacity'
  },
  equipmentLevel: {
    type: DataTypes.ENUM('basic', 'intermediate', 'advanced'),
    defaultValue: 'basic'
  },
  // Real-time tracking
  currentLatitude: {
    type: DataTypes.FLOAT
  },
  currentLongitude: {
    type: DataTypes.FLOAT
  },
  lastLocationUpdate: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('available', 'busy', 'offline', 'maintenance'),
    defaultValue: 'offline'
  },
  // Equipment tracking
  oxygenCapacityLiters: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  oxygenLastRefilled: {
    type: DataTypes.DATE
  },
  hasDefibrillator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasStretcher: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Maintenance
  lastServiceDate: {
    type: DataTypes.DATE
  },
  nextServiceDue: {
    type: DataTypes.DATE
  },
  roadWorthyExpiry: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'vehicles',
  timestamps: true
});

module.exports = Vehicle;