const authService = require('../services/authService');
const shaIntegrationService = require('../services/shaIntegrationService');
const apiResponse = require('../utils/apiResponse');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User } = require("../models");

const authController = {

  register: async (req, res, next) => {
    try {
      if (!req.body) {
        return apiResponse.error(res, "Invalid request", 400);
      }

      const result = await authService.register(req.body);
      apiResponse.success(res, result, 201);

    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return apiResponse.error(res, "Email and password are required", 400);
      }

      const result = await authService.login(email, password);
      apiResponse.success(res, result);

    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      await authService.logout(req.user.id);
      apiResponse.success(res, { message: "Logged out successfully" });

    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return apiResponse.error(res, "Refresh token required", 400);
      }

      const result = await authService.refreshToken(refreshToken);
      apiResponse.success(res, result);

    } catch (error) {
      next(error);
    }
  },

  getCurrentUser: async (req, res, next) => {
    try {
      const user = await authService.getUserById(req.user.id);
      apiResponse.success(res, user);

    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const updated = await authService.updateProfile(req.user.id, req.body);
      apiResponse.success(res, updated);

    } catch (error) {
      next(error);
    }
  },

  verifySHAMembership: async (req, res, next) => {
    try {
      const { idNumber } = req.body;

      if (!idNumber) {
        return apiResponse.error(res, "ID number required", 400);
      }

      const result = await shaIntegrationService.verifyMember(idNumber);
      apiResponse.success(res, result);

    } catch (error) {
      next(error);
    }
  },

  // ✅ MOVED INSIDE OBJECT

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");

      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      await transporter.sendMail({
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: "Password Reset Request",
        html: `
          <h3>Password Reset</h3>
          <p>Click the link below to reset your password:</p>
          <a href="${resetURL}">${resetURL}</a>
          <p>This link expires in 15 minutes.</p>
        `,
      });

      res.json({ message: "Reset link sent to email" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error sending reset email" });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        where: { resetToken: token },
      });

      if (!user || user.resetTokenExpiry < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      user.password = password; // Make sure hashing happens in model hook
      user.resetToken = null;
      user.resetTokenExpiry = null;

      await user.save();

      res.json({ message: "Password reset successful" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error resetting password" });
    }
  }

};

module.exports = authController;