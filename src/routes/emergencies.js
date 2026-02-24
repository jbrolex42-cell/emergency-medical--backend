const express = require('express');
const router = express.Router();
const { emergencyLimiter } = require('../middleware/security');
const { emergencyValidators } = require('../middleware/validators');
const { authenticate, authorize } = require('../middleware/auth');
const emergencyController = require('../controllers/emergencyController');

router.post('/', 
  emergencyLimiter,
  authenticate, 
  emergencyValidators.create, 
  emergencyController.create
);

router.get('/', authenticate, emergencyController.list);
router.get('/active', authenticate, authorize('provider', 'emt', 'admin'), emergencyController.getActive);
router.get('/:id', authenticate, emergencyController.getById);
router.put('/:id/status', authenticate, authorize('provider', 'emt', 'admin'), emergencyValidators.updateStatus, emergencyController.updateStatus);
router.post('/:id/assign', authenticate, authorize('provider', 'admin'), emergencyController.assignProvider);
router.post('/:id/location', authenticate, authorize('provider', 'emt'), emergencyController.updateLocation);

module.exports = router;