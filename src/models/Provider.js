const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Provider = sequelize.define("Provider", {

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
    type: DataTypes.ENUM(
      "private",
      "ngo",
      "county",
      "faith_based"
    ),
    allowNull: false
  },

  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  kmpdcVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  contactEmail: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },

  contactPhone: {
    type: DataTypes.STRING,
    validate: {
      is: /^(?:\+254|0)(7\d{8})$/
    }
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

  coverageRadiusKm: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: {
      min: 1,
      max: 500
    }
  },

  shaEmpaneled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  shaFacilityCode: {
    type: DataTypes.STRING
  },

  status: {
    type: DataTypes.ENUM(
      "active",
      "inactive",
      "suspended"
    ),
    defaultValue: "active"
  },

  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },

  totalResponses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  averageResponseTime: {
    type: DataTypes.INTEGER
  }

}, {
  tableName: "providers",
  timestamps: true
});

module.exports = Provider;