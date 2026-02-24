const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const authService = {
  register: async (userData) => {
    const existingUser = await User.findOne({ 
      where: { 
        email: userData.email 
      } 
    });
    
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const existingPhone = await User.findOne({
      where: { phone: userData.phone }
    });

    if (existingPhone) {
      throw new Error('Phone number already registered');
    }

    const user = await User.create(userData);
    const tokens = generateTokens(user.id);

    return { 
      user: user.toJSON(), 
      tokens,
      message: 'Registration successful. Please complete your profile.'
    };
  },

  login: async (email, password) => {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    await user.update({ lastLogin: new Date() });
    const tokens = generateTokens(user.id);

    return { 
      user: user.toJSON(), 
      tokens 
    };
  },

  logout: async (userId) => {
    // In a more complex system, invalidate refresh tokens here
    return true;
  },

  refreshToken: async (refreshToken) => {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      const tokens = generateTokens(decoded.userId);
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  },

  getUserById: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    return user.toJSON();
  },

  updateProfile: async (userId, updates) => {
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'emergencyContactName',
      'emergencyContactPhone', 'bloodType', 'allergies', 'medicalConditions'
    ];
    
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    });

    const user = await User.findByPk(userId);
    await user.update(updateData);
    return user.toJSON();
  }
};

module.exports = authService;