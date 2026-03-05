const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,

  phone: DataTypes.STRING,

  role: {
    type: DataTypes.ENUM("patient","provider","admin"),
    defaultValue: "patient"
  },

  county: DataTypes.STRING,

  idNumber: DataTypes.STRING,

  emergencyContactName: DataTypes.STRING,
  emergencyContactPhone: DataTypes.STRING,

  bloodType: DataTypes.STRING,
  allergies: DataTypes.TEXT,

  status: {
    type: DataTypes.STRING,
    defaultValue: "active"
  },

  resetToken: DataTypes.STRING,
  resetTokenExpiry: DataTypes.DATE

},
{
  hooks:{
    beforeCreate: async (user)=>{
      user.password = await bcrypt.hash(user.password,10);
    },
    beforeUpdate: async (user)=>{
      if(user.changed("password")){
        user.password = await bcrypt.hash(user.password,10);
      }
    }
  }
});

module.exports = User;