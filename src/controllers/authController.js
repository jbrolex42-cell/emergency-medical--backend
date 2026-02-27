const authService = require('../services/authService');
const shaIntegrationService = require('../services/shaIntegrationService');
const apiResponse = require('../utils/apiResponse');

const authController = {
  register: async (req, res, next) => {
    try {
      const userData = req.body;
      const result = await authService.register(userData);
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
      apiResponse.success(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
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
      const result = await shaIntegrationService.verifyMember(idNumber);
      apiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;