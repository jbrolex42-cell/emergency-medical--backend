const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../models');
const { JWT_SECRET } = require('../config/env');

const authService = {

async register(data){
  // hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    email: data.email,
    password: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: data.role,
    county: data.county,
    idNumber: data.idNumber,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    bloodType: data.bloodType,
    allergies: data.allergies
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  return {
    user: user.toJSON ? user.toJSON() : user,
    tokens: { accessToken: token }
  };
},

async login(identifier, password){
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { phone: identifier }
      ]
    }
  });

  if(!user){
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.password);

  if(!valid){
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  return {
    user: user.toJSON ? user.toJSON() : user,
    tokens: { accessToken: token }
  };
},

async getUserById(id){
  return User.findByPk(id, { attributes: { exclude: ['password'] } });
},

async updateProfile(id,data){
  if(data.password){
    // if updating password, hash it
    data.password = await bcrypt.hash(data.password, 10);
  }
  await User.update(data, { where:{id} });
  return this.getUserById(id);
},

async logout(){
  return true;
},

async refreshToken(){
  return true;
}

};

module.exports = authService;
