const emergencyService = require('../services/emergencyService');
const what3wordsService = require('../services/what3wordsService');
const apiResponse = require('../utils/apiResponse');

const emergencyController = {
  create: async (req, res, next) => {
    try {
      const emergencyData = {
        ...req.body,
        userId: req.user.id
      };

      // Convert coordinates to what3words if not provided
      if (!emergencyData.what3words && emergencyData.location) {
        try {
          emergencyData.what3words = await what3wordsService.coordinatesToWords(
            emergencyData.location.latitude,
            emergencyData.location.longitude
          );
        } catch (e) {
          console.log('what3words conversion failed, continuing without it');
        }
      }

      const result = await emergencyService.create(emergencyData);
      apiResponse.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const emergencies = await emergencyService.getUserEmergencies(req.user.id);
      apiResponse.success(res, emergencies);
    } catch (error) {
      next(error);
    }
  },

  getActive: async (req, res, next) => {
    try {
      const emergencies = await emergencyService.getActiveEmergencies();
      apiResponse.success(res, emergencies);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const emergency = await emergencyService.getById(req.params.id);
      apiResponse.success(res, emergency);
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      const result = await emergencyService.updateStatus(req.params.id, status, req.user.id);
      apiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  assignProvider: async (req, res, next) => {
    try {
      const { providerId, vehicleId, responseUnitId } = req.body;
      const result = await emergencyService.assignProvider(
        req.params.id, 
        providerId, 
        vehicleId, 
        responseUnitId
      );
      apiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  updateLocation: async (req, res, next) => {
    try {
      const { latitude, longitude } = req.body;
      const result = await emergencyService.updateResponderLocation(
        req.params.id,
        latitude,
        longitude
      );
      apiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = emergencyController;