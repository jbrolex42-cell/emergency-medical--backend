const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { JWT_SECRET } = require("../config/env");

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const authService = {

  register: async (userData) => {
    if (!userData?.email || !userData?.password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const email = userData.email.toLowerCase();

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }

    if (userData.phone) {
      const existingPhone = await User.findOne({
        where: { phone: userData.phone }
      });

      if (existingPhone) {
        const error = new Error("Phone number already registered");
        error.statusCode = 409;
        throw error;
      }
    }

  
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await User.create({
      ...userData,
      email,
      password: hashedPassword
    });

    const tokens = generateTokens(user.id);

    return {
      user: user.toJSON(),
      tokens,
      message: "Registration successful"
    };
  },

  login: async (identifier, password) => {

  if (!identifier || !password) {
    const error = new Error("Email/Phone and password are required");
    error.statusCode = 400;
    throw error;
  }

  identifier = identifier.toLowerCase().trim();

  let user;

  if (identifier.includes("@")) {

    user = await User.findOne({
      where: { email: identifier }
    });

  } else {

  
    const normalizedPhone = identifier.replace(/\s+/g, "");

    user = await User.findOne({
      where: { phone: normalizedPhone }
    });
  }

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!isValidPassword) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  if (user.status && user.status !== "active") {
    const error = new Error("Account is not active");
    error.statusCode = 403;
    throw error;
  }

  await user.update({
    lastLogin: new Date()
  });

  const tokens = generateTokens(user.id);

  return {
    user: user.toJSON(),
    tokens
  };
},
  

 
  logout: async () => {
    return true;
  },


  refreshToken: async (refreshToken) => {
    if (!refreshToken) {
      const error = new Error("Refresh token missing");
      error.statusCode = 400;
      throw error;
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      return generateTokens(decoded.userId);
    } catch {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }
  },


  getUserById: async (userId) => {

    const user = await User.findByPk(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
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
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    await user.update(updateData);

    return user.toJSON();
  }

};

module.exports = authService;