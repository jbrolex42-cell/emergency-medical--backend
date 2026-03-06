const authService = require('../services/authService');
const apiResponse = require('../utils/apiResponse');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../models');

const authController = {

async register(req,res,next){
  try{
    const result = await authService.register(req.body);
    return apiResponse.success(res,result,201);
  }catch(error){
    next(error);
  }
},

async login(req,res,next){
  try{
    const { identifier, email, phone, password } = req.body;
    const loginId = identifier || email || phone;
    const result = await authService.login(loginId,password);
    return apiResponse.success(res,result);
  }catch(error){
    next(error);
  }
},

async getCurrentUser(req,res,next){
  try{
    const user = await authService.getUserById(req.user.id);
    apiResponse.success(res,user);
  }catch(error){
    next(error);
  }
},

async updateProfile(req,res,next){
  try{
    const user = await authService.updateProfile(req.user.id,req.body);
    apiResponse.success(res,user);
  }catch(error){
    next(error);
  }
},

async forgotPassword(req,res){
  try{
    const { email } = req.body;
    const user = await User.findOne({where:{email}});
    if(!user){
      return res.status(404).json({message:'User not found'});
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now()+15*60*1000;
    await user.save();
    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth:{ user:process.env.EMAIL_USER, pass:process.env.EMAIL_PASS }
    });
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await transporter.sendMail({
      to:user.email,
      subject:'Password Reset',
      html:`<p>Reset your password</p><a href="${resetURL}">${resetURL}</a>`
    });
    res.json({message:'Reset email sent'});
  }catch(error){
    res.status(500).json({message:'Error sending reset email'});
  }
},

async resetPassword(req,res){
  try{
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ where:{ resetToken:token } });
    if(!user || user.resetTokenExpiry < Date.now()){
      return res.status(400).json({message:'Invalid token'});
    }
    user.password = await require('bcrypt').hash(password,10);
    user.resetToken=null;
    user.resetTokenExpiry=null;
    await user.save();
    res.json({message:'Password updated'});
  }catch(error){
    res.status(500).json({message:'Reset failed'});
  }
}

};

module.exports = authController;
