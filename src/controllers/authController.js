const authService = require("../services/authService");
const apiResponse = require("../utils/apiResponse");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { User } = require("../models");

const authController = {

  // REGISTER
  async register(req, res, next) {
    try {

      const { password, confirmPassword } = req.body;

      // Password match validation
      if (!password || !confirmPassword) {
        return apiResponse.error(res, "Password and confirm password are required", 400);
      }

      if (password !== confirmPassword) {
        return apiResponse.error(res, "Passwords do not match", 400);
      }

      const result = await authService.register(req.body);

      return apiResponse.success(res, result, 201);

    } catch (error) {
      next(error);
    }
  },

  // LOGIN
  async login(req, res, next) {
    try {

      const { identifier, email, phone, password } = req.body;

      const loginId = identifier || email || phone;

      if (!loginId || !password) {
        return apiResponse.error(res, "Login credentials required", 400);
      }

      const result = await authService.login(loginId, password);

      return apiResponse.success(res, result);

    } catch (error) {
      next(error);
    }
  },

  // CURRENT USER
  async getCurrentUser(req, res, next) {
    try {

      const user = await authService.getUserById(req.user.id);

      return apiResponse.success(res, user);

    } catch (error) {
      next(error);
    }
  },

  // UPDATE PROFILE
  async updateProfile(req, res, next) {
    try {

      const user = await authService.updateProfile(req.user.id, req.body);

      return apiResponse.success(res, user);

    } catch (error) {
      next(error);
    }
  },

  // FORGOT PASSWORD
  async forgotPassword(req, res) {
    try {

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = crypto.randomBytes(32).toString("hex");

      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

      await transporter.sendMail({
        to: user.email,
        subject: "Password Reset",
        html: `
          <h3>Password Reset Request</h3>
          <p>Click the link below to reset your password:</p>
          <a href="${resetURL}">${resetURL}</a>
          <p>This link expires in 15 minutes.</p>
        `
      });

      return res.json({ message: "Reset email sent" });

    } catch (error) {

      console.error(error);
      res.status(500).json({ message: "Error sending reset email" });

    }
  },

  // RESET PASSWORD
  async resetPassword(req, res) {
    try {

      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password required" });
      }

      const user = await User.findOne({
        where: { resetToken: token }
      });

      if (!user || user.resetTokenExpiry < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiry = null;

      await user.save();

      return res.json({ message: "Password updated successfully" });

    } catch (error) {

      console.error(error);
      res.status(500).json({ message: "Reset failed" });

    }
  }

};

module.exports = authController;