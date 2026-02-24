const { EmergencyRequest, User, Provider, Vehicle, ResponseUnit } = require('../models');
const notificationService = require('./notificationService');
const shaIntegrationService = require('./shaIntegrationService');

const emergencyService = {
  create: async (emergencyData) => {
    // Create emergency record
    const emergency = await EmergencyRequest.create({
      userId: emergencyData.userId,
      type: emergencyData.type,
      severity: emergencyData.severity,
      description: emergencyData.description,
      latitude: emergencyData.location.latitude,
      longitude: emergencyData.location.longitude,
      what3words: emergencyData.what3words,
      address: emergencyData.address,
      status: 'pending'
    });

    // Verify SHA coverage if user has SHA number
    const user = await User.findByPk(emergencyData.userId);
    if (user.shaNumber) {
      try {
        const shaVerified = await shaIntegrationService.verifyCoverage(user.shaNumber);
        await emergency.update({ shaVerified: shaVerified.active });
      } catch (e) {
        console.log('SHA verification failed, continuing without it');
      }
    }

    // Find nearest available providers (dual-tier logic)
    const nearestProviders = await findNearestProviders(
      emergencyData.location.latitude,
      emergencyData.location.longitude,
      emergencyData.severity
    );

    // Notify providers
    if (nearestProviders.length > 0) {
      await notificationService.notifyProviders(nearestProviders, emergency);
    }

    // Notify user
    await notificationService.notifyUser(user.phone, {
      type: 'emergency_created',
      message: `Emergency reported. ID: ${emergency.id}. Help is on the way.`
    });

    return {
      emergency: await EmergencyRequest.findByPk(emergency.id, {
        include: [{ model: User, attributes: ['firstName', 'lastName', 'phone'] }]
      }),
      nearbyProviders: nearestProviders.length,
      estimatedWaitTime: calculateWaitTime(nearestProviders[0])
    };
  },

  getUserEmergencies: async (userId) => {
    return await EmergencyRequest.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        { model: Provider, attributes: ['name', 'contactPhone'] },
        { model: Vehicle, attributes: ['type', 'registrationNumber'] }
      ]
    });
  },

  getActiveEmergencies: async () => {
    return await EmergencyRequest.findAll({
      where: { 
        status: ['pending', 'dispatched', 'en_route', 'on_scene', 'transporting'] 
      },
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'phone'] },
        { model: Provider, attributes: ['name'] }
      ],
      order: [['severity', 'ASC'], ['createdAt', 'ASC']]
    });
  },

  getById: async (id) => {
    const emergency = await EmergencyRequest.findByPk(id, {
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'phone', 'bloodType', 'allergies'] },
        { model: Provider },
        { model: Vehicle },
        { model: ResponseUnit }
      ]
    });
    
    if (!emergency) throw new Error('Emergency not found');
    return emergency;
  },

  updateStatus: async (id, status, updatedBy) => {
    const emergency = await EmergencyRequest.findByPk(id);
    if (!emergency) throw new Error('Emergency not found');

    const updateData = { status };
    
    // Track timestamps
    const now = new Date();
    switch(status) {
      case 'dispatched':
        updateData.dispatchedAt = now;
        break;
      case 'en_route':
        updateData.enRouteAt = now;
        break;
      case 'on_scene':
        updateData.onSceneAt = now;
        if (emergency.dispatchedAt) {
          updateData.responseTimeMinutes = Math.round(
            (now - emergency.dispatchedAt) / 60000
          );
        }
        break;
      case 'completed':
        updateData.completedAt = now;
        break;
    }

    await emergency.update(updateData);

    // Notify user of status change
    const user = await User.findByPk(emergency.userId);
    await notificationService.notifyUser(user.phone, {
      type: 'status_update',
      message: `Emergency status updated to: ${status.replace('_', ' ')}`
    });

    return emergency;
  },

  assignProvider: async (emergencyId, providerId, vehicleId, responseUnitId) => {
    const emergency = await EmergencyRequest.findByPk(emergencyId);
    if (!emergency) throw new Error('Emergency not found');

    await emergency.update({
      assignedProviderId: providerId,
      assignedVehicleId: vehicleId,
      assignedResponseUnitId: responseUnitId,
      status: 'dispatched'
    });

    return await EmergencyRequest.findByPk(emergencyId, {
      include: [Provider, Vehicle, ResponseUnit]
    });
  },

  updateResponderLocation: async (emergencyId, latitude, longitude) => {
    // Update vehicle or response unit location
    // This would be called periodically by the responder app
    return { latitude, longitude, updatedAt: new Date() };
  }
};

// Helper functions
async function findNearestProviders(lat, lng, severity) {
  // In production, this would use PostGIS for geospatial queries
  // For now, return available providers sorted by distance
  const providers = await Provider.findAll({
    where: { status: 'active' },
    include: [
      { 
        model: Vehicle, 
        where: { status: 'available' },
        required: false 
      },
      {
        model: ResponseUnit,
        where: { status: 'available' },
        required: false
      }
    ]
  });

  // Calculate distances and sort
  return providers.map(p => ({
    ...p.toJSON(),
    distance: calculateDistance(lat, lng, p.latitude, p.longitude)
  })).sort((a, b) => a.distance - b.distance).slice(0, 5);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateWaitTime(nearestProvider) {
  if (!nearestProvider) return null;
  // Estimate 2 minutes per km in rural areas, 1 minute in urban
  const minutes = Math.ceil(nearestProvider.distance * 2);
  return Math.max(minutes, 10); // Minimum 10 minutes
}

module.exports = emergencyService;