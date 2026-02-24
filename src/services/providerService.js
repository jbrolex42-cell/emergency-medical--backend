const { Provider, Vehicle, ResponseUnit } = require('../models');
const { Op } = require('sequelize');

const providerService = {
  list: async (filters = {}) => {
    const where = { status: 'active' };
    
    if (filters.county) where.county = filters.county;
    if (filters.type) where.type = filters.type;
    if (filters.shaEmpaneled) where.shaEmpaneled = filters.shaEmpaneled === 'true';

    return await Provider.findAll({
      where,
      include: [
        { model: Vehicle, where: { status: 'available' }, required: false },
        { model: ResponseUnit, where: { status: 'available' }, required: false }
      ]
    });
  },

  getNearby: async (lat, lng, radiusKm = 50) => {
    // In production, use PostGIS ST_DWithin
    // For now, return all active with distance calculation
    const providers = await Provider.findAll({
      where: { status: 'active' },
      include: [Vehicle, ResponseUnit]
    });

    return providers.map(p => ({
      ...p.toJSON(),
      distance: calculateDistance(lat, lng, p.latitude, p.longitude)
    })).filter(p => p.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  },

  getById: async (id) => {
    const provider = await Provider.findByPk(id, {
      include: [Vehicle, ResponseUnit]
    });
    if (!provider) throw new Error('Provider not found');
    return provider;
  },

  create: async (data) => {
    return await Provider.create(data);
  },

  update: async (id, updates) => {
    const provider = await Provider.findByPk(id);
    if (!provider) throw new Error('Provider not found');
    
    await provider.update(updates);
    return provider;
  },

  getVehicles: async (providerId) => {
    return await Vehicle.findAll({
      where: { providerId }
    });
  },

  addVehicle: async (providerId, vehicleData) => {
    return await Vehicle.create({
      ...vehicleData,
      providerId
    });
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = providerService;