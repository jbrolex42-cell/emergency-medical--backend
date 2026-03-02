const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth");
const { subscriptionValidators } = require("../middleware/validators");
const subscriptionController = require("../controllers/subscriptionController");


router.get(
  "/plans",
  authenticate,
  subscriptionController.getPlans
);


router.post(
  "/",
  authenticate,
  subscriptionValidators?.create || ((req, res, next) => next()),
  subscriptionController.create
);

router.get(
  "/current",
  authenticate,
  subscriptionController.getCurrent
);

router.post(
  "/renew",
  authenticate,
  subscriptionController.renew
);

router.post(
  "/mpesa-callback",
  subscriptionController.mpesaCallback
);

module.exports = router;