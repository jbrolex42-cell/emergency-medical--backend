const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth");
const providerController = require("../controllers/providerController");

router.get(
  "/nearby",
  providerController.getNearby
);


router.get(
  "/",
  authenticate,
  providerController.list
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  providerController.create
);


router.get(
  "/:id/vehicles",
  providerController.getVehicles
);

router.post(
  "/:id/vehicles",
  authenticate,
  authorize("provider", "admin"),
  providerController.addVehicle
);


router.get(
  "/:id",
  providerController.getById
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "provider"),
  providerController.update
);

module.exports = router;