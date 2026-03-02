const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ResponseUnit = sequelize.define("ResponseUnit", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  providerId: {
    type: DataTypes.UUID,
    allowNull: false
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  type: {
    type: DataTypes.ENUM(
      "motorcycle",
      "bicycle",
      "foot"
    ),
    defaultValue: "motorcycle"
  },

  emtName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  emtLicenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  emtPhone: {
    type: DataTypes.STRING,
    validate: {
      is: /^(?:\+254|0)(7\d{8})$/
    }
  },

  currentLatitude: {
    type: DataTypes.FLOAT,
    validate: {
      min: -5,
      max: 5.5
    }
  },

  currentLongitude: {
    type: DataTypes.FLOAT,
    validate: {
      min: 33,
      max: 42
    }
  },

  lastLocationUpdate: {
    type: DataTypes.DATE
  },

  status: {
    type: DataTypes.ENUM(
      "available",
      "busy",
      "offline"
    ),
    defaultValue: "offline"
  },

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
  tableName: "response_units",
  timestamps: true
});

module.exports = ResponseUnit;