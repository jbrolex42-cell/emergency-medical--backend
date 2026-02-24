const subscriptionService = require('../services/subscriptionService');
const apiResponse = require('../utils/apiResponse');

const subscriptionController = {
  getPlans: async (req, res, next) => {
    try {
      const plans = await subscriptionService.getPlans();
      apiResponse.success(res, plans);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const result = await subscriptionService.create(req.user.id, req.body);
      apiResponse.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  getCurrent: async (req, res, next) => {
    try {
      const subscription = await subscriptionService.getCurrent(req.user.id);
      apiResponse.success(res, subscription);
    } catch (error) {
      next(error);
    }
  },

  renew: async (req, res, next) => {
    try {
      const result = await subscriptionService.renew(req.user.id);
      apiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  mpesaCallback: async (req, res, next) => {
    try {
      await subscriptionService.processMpesaCallback(req.body);
      res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = subscriptionController;