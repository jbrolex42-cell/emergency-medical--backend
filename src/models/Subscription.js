const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Subscription = sequelize.define("Subscription", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },

  plan: {
    type: DataTypes.ENUM(
      "basic",
      "family",
      "corporate"
    ),
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM(
      "active",
      "expired",
      "cancelled",
      "pending"
    ),
    defaultValue: "pending"
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },

  currency: {
    type: DataTypes.STRING,
    defaultValue: "KES"
  },

  paymentMethod: {
    type: DataTypes.ENUM(
      "mpesa",
      "bank",
      "sha"
    ),
    allowNull: false
  },

  transactionReference: {
    type: DataTypes.STRING
  },

  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },

  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterStart(value) {
        if (this.startDate && value <= this.startDate) {
          throw new Error("End date must be after start date");
        }
      }
    }
  },

  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  shaCovered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  shaAuthorizationCode: {
    type: DataTypes.STRING
  }

}, {
  tableName: "subscriptions",
  timestamps: true
});

module.exports = Subscription;