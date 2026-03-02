const providerService = require('../services/providerService');
const apiResponse = require('../utils/apiResponse');

const providerController = {

  list: async (req, res, next) => {
    try {

      const providers = await providerService.list(req.query);

      apiResponse.success(res, providers);

    } catch (error) {
      next(error);
    }
  },

  getNearby: async (req, res, next) => {
    try {

      const { lat, lng, radius } = req.query;

      if (!lat || !lng) {
        return apiResponse.error(
          res,
          "Latitude and longitude required",
          400
        );
      }

      const providers = await providerService.getNearby(
        parseFloat(lat),
        parseFloat(lng),
        parseInt(radius) || 50
      );

      apiResponse.success(res, providers);

    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {

      if (!req.params.id) {
        return apiResponse.error(res, "Provider ID required", 400);
      }

      const provider = await providerService.getById(req.params.id);

      apiResponse.success(res, provider);

    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {

      if (!req.body) {
        return apiResponse.error(res, "Invalid request", 400);
      }

      const result = await providerService.create(req.body);

      apiResponse.success(res, result, 201);

    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {

      if (!req.params.id) {
        return apiResponse.error(res, "Provider ID required", 400);
      }

      const result = await providerService.update(
        req.params.id,
        req.body
      );

      apiResponse.success(res, result);

    } catch (error) {
      next(error);
    }
  },

  getVehicles: async (req, res, next) => {
    try {

      const vehicles =
        await providerService.getVehicles(req.params.id);

      apiResponse.success(res, vehicles);

    } catch (error) {
      next(error);
    }
  },

  addVehicle: async (req, res, next) => {
    try {

      const result =
        await providerService.addVehicle(
          req.params.id,
          req.body
        );

      apiResponse.success(res, result, 201);

    } catch (error) {
      next(error);
    }
  }

};

module.exports = providerController;