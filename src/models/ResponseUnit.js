const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ResponseUnit = sequelize.define('ResponseUnit', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('motorcycle', 'bicycle', 'foot'),
    defaultValue: 'motorcycle'
  },
  // EMT/Personnel info
  emtName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emtLicenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'KMPDC EMT license'
  },
  emtPhone: {
    type: DataTypes.STRING
  },
  // Location tracking
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
    type: DataTypes.ENUM('available', 'busy', 'offline'),
    defaultValue: 'offline'
  },
  // Equipment (lightweight for motorcycle responders)
  hasOxygen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasFirstAidKit: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  hasPulseOximeter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasStretcher: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'response_units',
  timestamps: true
});

module.exports = ResponseUnit;