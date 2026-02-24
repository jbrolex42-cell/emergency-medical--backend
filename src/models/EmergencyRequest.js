const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmergencyRequest = sequelize.define('EmergencyRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('medical', 'trauma', 'maternal', 'cardiac', 'respiratory', 'other'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('critical', 'urgent', 'moderate', 'minor'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'dispatched', 'en_route', 'on_scene', 'transporting', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.TEXT
  },
  // Location data (GPS + what3words)
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  what3words: {
    type: DataTypes.STRING,
    comment: 'what3words address for rural locations'
  },
  address: {
    type: DataTypes.TEXT,
    comment: 'Human-readable address or landmark'
  },
  // SHA Integration
  shaVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shaClaimNumber: {
    type: DataTypes.STRING
  },
  // Assignment
  assignedProviderId: {
    type: DataTypes.UUID,
    references: {
      model: 'providers',
      key: 'id'
    }
  },
  assignedVehicleId: {
    type: DataTypes.UUID,
    references: {
      model: 'vehicles',
      key: 'id'
    }
  },
  assignedResponseUnitId: {
    type: DataTypes.UUID,
    references: {
      model: 'response_units',
      key: 'id'
    }
  },
  // Timestamps for response tracking
  dispatchedAt: {
    type: DataTypes.DATE
  },
  enRouteAt: {
    type: DataTypes.DATE
  },
  onSceneAt: {
    type: DataTypes.DATE
  },
  completedAt: {
    type: DataTypes.DATE
  },
  // Response metrics
  responseTimeMinutes: {
    type: DataTypes.INTEGER,
    comment: 'Time from dispatch to on-scene in minutes'
  },
  // Patient info at time of emergency
  patientCondition: {
    type: DataTypes.TEXT
  },
  treatmentProvided: {
    type: DataTypes.TEXT
  },
  destinationHospital: {
    type: DataTypes.STRING
  },
  // For offline sync
  offlineCreated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  syncStatus: {
    type: DataTypes.ENUM('synced', 'pending', 'failed'),
    defaultValue: 'synced'
  }
}, {
  tableName: 'emergency_requests',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['userId'] },
    { fields: ['assignedProviderId'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = EmergencyRequest;