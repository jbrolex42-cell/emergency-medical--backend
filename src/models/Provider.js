const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Provider = sequelize.define('Provider', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('private', 'ngo', 'county', 'faith_based'),
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'KMPDC license number'
  },
  kmpdcVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  contactEmail: {
    type: DataTypes.STRING
  },
  contactPhone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  county: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subCounty: {
    type: DataTypes.STRING
  },
  // Coverage area
  coverageRadiusKm: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  // SHA Empanelment
  shaEmpaneled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shaFacilityCode: {
    type: DataTypes.STRING
  },
  // Operational status
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0
  },
  totalResponses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageResponseTime: {
    type: DataTypes.INTEGER,
    comment: 'Average response time in minutes'
  }
}, {
  tableName: 'providers',
  timestamps: true
});

module.exports = Provider;