const express = require("express");
const router = express.Router();

const { authLimiter } = require("../middleware/security");
const { authValidators } = require("../middleware/validators");
const { authenticate } = require("../middleware/auth");

const authController = require("../controllers/authController");

router.post(
    "/register",
    authLimiter,
    authValidators.register,
    authController.register
);

router.post(
    "/login",
    authLimiter,
    authValidators.login,
    authController.login
);

router.post(
    "/logout",
    authenticate,
    authController.logout
);

router.post(
    "/refresh",
    authController.refreshToken
);

router.get(
    "/me",
    authenticate,
    authController.getCurrentUser
);

router.put(
    "/profile",
    authenticate,
    authController.updateProfile
);

router.post(
    "/verify-sha",
    authenticate,
    authController.verifySHAMembership
);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);


module.exports = router;