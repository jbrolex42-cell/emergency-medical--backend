const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const providerController = require('../controllers/providerController');

router.get('/', providerController.list);
router.get('/nearby', providerController.getNearby);
router.get('/:id', providerController.getById);
router.post('/', authenticate, authorize('admin'), providerController.create);
router.put('/:id', authenticate, authorize('admin', 'provider'), providerController.update);
router.get('/:id/vehicles', providerController.getVehicles);
router.post('/:id/vehicles', authenticate, authorize('provider', 'admin'), providerController.addVehicle);

module.exports = router;