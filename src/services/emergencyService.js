const { EmergencyRequest, User, Provider, Vehicle, ResponseUnit, sequelize } = require('../models');
const notificationService = require('./notificationService');
const shaIntegrationService = require('./shaIntegrationService');


const STATUS_TRANSITIONS = {
  pending: ["dispatched", "cancelled"],
  dispatched: ["en_route", "cancelled"],
  en_route: ["on_scene"],
  on_scene: ["transporting", "completed"],
  transporting: ["completed"]
};

function calculateDistance(lat1, lon1, lat2, lon2) {

  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calculateWaitTime(distanceKm) {
  if (!distanceKm || distanceKm === Infinity) return null;

  const minutes = Math.ceil(distanceKm * 2);

  return Math.max(minutes, 10);
}

async function findNearestProviders(lat, lng) {

  const providers = await Provider.findAll({
    where: { status: "active" },
    include: [
      {
        model: Vehicle,
        where: { status: "available" },
        required: false
      },
      {
        model: ResponseUnit,
        where: { status: "available" },
        required: false
      }
    ]
  });

  return providers
    .map(p => ({
      ...p.toJSON(),
      distance: calculateDistance(
        lat,
        lng,
        p.latitude,
        p.longitude
      )
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
}


const emergencyService = {

  create: async (emergencyData) => {

    const transaction = await sequelize.transaction();

    try {

      const emergency = await EmergencyRequest.create({
        userId: emergencyData.userId,
        type: emergencyData.type,
        severity: emergencyData.severity,
        description: emergencyData.description,
        latitude: emergencyData.location?.latitude,
        longitude: emergencyData.location?.longitude,
        what3words: emergencyData.what3words,
        address: emergencyData.address,
        status: "pending"
      }, { transaction });

      const user = await User.findByPk(emergencyData.userId);

      if (user?.shaNumber) {
        try {
          const shaVerified =
            await shaIntegrationService.verifyCoverage(
              user.shaNumber
            );

          await emergency.update(
            { shaVerified: shaVerified?.active },
            { transaction }
          );

        } catch {
          console.log("SHA verification failed");
        }
      }

      let nearestProviders = [];

      if (emergencyData.location) {
        nearestProviders = await findNearestProviders(
          emergencyData.location.latitude,
          emergencyData.location.longitude
        );
      }

      if (user?.phone) {
        try {
          await notificationService.notifyUser(user.phone, {
            type: "emergency_created",
            message: `Emergency reported. ID: ${emergency.id}`
          });
        } catch {
          console.log("User notification failed");
        }
      }

      await transaction.commit();

      return {
        emergency: emergency,
        nearbyProviders: nearestProviders.length,
        estimatedWaitTime: calculateWaitTime(
          nearestProviders[0]?.distance
        )
      };

    } catch (error) {

      await transaction.rollback();
      throw error;
    }
  },

  getUserEmergencies: async (userId) => {

    return EmergencyRequest.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Provider },
        { model: Vehicle }
      ]
    });
  },


  getActiveEmergencies: async () => {

    return EmergencyRequest.findAll({
      where: {
        status: ["pending", "dispatched", "en_route", "on_scene", "transporting"]
      },
      include: [User, Provider],
      order: [["severity", "ASC"], ["createdAt", "ASC"]]
    });
  },

  updateStatus: async (id, status, updatedBy) => {

    const emergency = await EmergencyRequest.findByPk(id);

    if (!emergency) throw new Error("Emergency not found");

    const allowedNext =
      STATUS_TRANSITIONS[emergency.status] || [];

    if (!allowedNext.includes(status)) {
      throw new Error("Invalid status transition");
    }

    const updateData = { status };

    const now = new Date();

    if (status === "dispatched") updateData.dispatchedAt = now;
    if (status === "en_route") updateData.enRouteAt = now;
    if (status === "on_scene") updateData.onSceneAt = now;
    if (status === "completed") updateData.completedAt = now;

    await emergency.update(updateData);

    const user = await User.findByPk(emergency.userId);

    if (user?.phone) {
      try {
        await notificationService.notifyUser(user.phone, {
          type: "status_update",
          message: `Emergency status updated to ${status.replace("_", " ")}`
        });
      } catch {
        console.log("Notification failed");
      }
    }

    return emergency;
  },


  assignProvider: async (emergencyId, providerId, vehicleId, responseUnitId) => {

    const emergency = await EmergencyRequest.findByPk(emergencyId);

    if (!emergency) throw new Error("Emergency not found");

    await emergency.update({
      assignedProviderId: providerId,
      assignedVehicleId: vehicleId,
      assignedResponseUnitId: responseUnitId,
      status: "dispatched"
    });

    return EmergencyRequest.findByPk(emergencyId, {
      include: [Provider, Vehicle, ResponseUnit]
    });
  },

  updateResponderLocation: async () => {
    return {
      updatedAt: new Date()
    };
  }
};

module.exports = emergencyService;