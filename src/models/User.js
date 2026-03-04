const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      validate: {
        isEmail: true,
        len: [5, 100],
      },
    },

    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      validate: {
        is: /^[0-9+\-() ]+$/,
        len: [7, 20],
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100],
      },
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    idNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    shaNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("user", "provider", "emt", "admin"),
      defaultValue: "user",
    },

    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "active",
    },

    resetToken: DataTypes.STRING,
    resetTokenExpiry: DataTypes.DATE,

    emergencyContactName: DataTypes.STRING,
    emergencyContactPhone: DataTypes.STRING,
    bloodType: {
      type: DataTypes.ENUM(
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
      ),
    },

    allergies: DataTypes.TEXT,
    medicalConditions: DataTypes.TEXT,

    lastLogin: DataTypes.DATE,
  },
  {
    tableName: "users",
    timestamps: true,

    hooks: {
      beforeValidate: (user) => {
        if (!user.email && !user.phone) {
          throw new Error("Either email or phone is required");
        }

        if (user.phone) {
          user.phone = user.phone.replace(/\s+/g, "");
        }
      },

      beforeCreate: async (user) => {
        if (user.email) {
          user.email = user.email.toLowerCase();
        }

        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },

      beforeUpdate: async (user) => {
        if (user.changed("email") && user.email) {
          user.email = user.email.toLowerCase();
        }

        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

User.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.resetToken;
  return values;
};

module.exports = User;