const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../config/env');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};


const authService = {


  register: async (userData) => {
    try {

      if (!userData?.email || !userData?.password) {
        throw new Error("Email and password are required");
      }

      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      if (userData.phone) {
        const existingPhone = await User.findOne({
          where: { phone: userData.phone }
        });

        if (existingPhone) {
          throw new Error("Phone number already registered");
        }
      }

      const user = await User.create(userData);

      const tokens = generateTokens(user.id);

      return {
        user: user.toJSON(),
        tokens,
        message: "Registration successful"
      };

    } catch (error) {
      throw error;
    }
  },


  login: async (email, password) => {
    try {

      if (!email || !password) {
        throw new Error("Invalid credentials");
      }

      const user = await User.findOne({
        where: { email }
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      if (typeof user.validatePassword !== "function") {
        throw new Error("Authentication system error");
      }

      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      if (user.status && user.status !== "active") {
        throw new Error("Account is not active");
      }

      await user.update({
        lastLogin: new Date()
      });

      const tokens = generateTokens(user.id);

      return {
        user: user.toJSON(),
        tokens
      };

    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    return true;
  },


  refreshToken: async (refreshToken) => {
    try {

      if (!refreshToken) {
        throw new Error("Refresh token missing");
      }

      const decoded = jwt.verify(refreshToken, JWT_SECRET);

      return generateTokens(decoded.userId);

    } catch {
      throw new Error("Invalid refresh token");
    }
  },


  getUserById: async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user.toJSON();
  },

  updateProfile: async (userId, updates) => {

    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "emergencyContactName",
      "emergencyContactPhone",
      "bloodType",
      "allergies",
      "medicalConditions"
    ];

    const updateData = {};

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await user.update(updateData);

    return user.toJSON();
  }
};

module.exports = authService;