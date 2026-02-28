const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const emergencyRoutes = require('./emergencies');
const subscriptionRoutes = require('./subscriptions');
const providerRoutes = require('./providers');

router.use('/auth', authRoutes);
router.use('/emergencies', emergencyRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/providers', providerRoutes);

module.exports = router;