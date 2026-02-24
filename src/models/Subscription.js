const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
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
  plan: {
    type: DataTypes.ENUM('basic', 'family', 'corporate'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled', 'pending'),
    defaultValue: 'pending'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'KES'
  },
  paymentMethod: {
    type: DataTypes.ENUM('mpesa', 'bank', 'sha'),
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
    allowNull: false
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // SHA specific
  shaCovered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether covered by SHA ECCIF'
  },
  shaAuthorizationCode: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'subscriptions',
  timestamps: true
});

module.exports = Subscription;