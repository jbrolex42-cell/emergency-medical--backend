const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [5, 100]
      }
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100]
      }
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[0-9+\-() ]+$/,
        len: [7, 20]
      }
    },

    idNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [5, 20]
      }
    },

    shaNumber: {
      type: DataTypes.STRING,
      unique: true
    },

    role: {
      type: DataTypes.ENUM("user", "provider", "emt", "admin"),
      defaultValue: "user"
    },

    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "active"
    },

    emergencyContactName: {
      type: DataTypes.STRING
    },

    emergencyContactPhone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9+\-() ]+$/
      }
    },

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
      )
    },

    allergies: {
      type: DataTypes.TEXT
    },

    medicalConditions: {
      type: DataTypes.TEXT
    },

    lastLogin: {
      type: DataTypes.DATE
    }
  },

  {
    tableName: "users",
    timestamps: true,

    hooks: {
      beforeCreate: async (user) => {
        if (user.email) {
          user.email = user.email.toLowerCase();
        }

        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },

      beforeUpdate: async (user) => {
        if (user.changed("email")) {
          user.email = user.email.toLowerCase();
        }

        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  }
);


User.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };

  delete values.password;

  return values;
};

module.exports = User;