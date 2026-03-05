const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authValidators } = require("../validators/validator.js");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/register",authValidators.register,authController.register);

router.post("/login",authValidators.login,authController.login);

router.get("/me",authenticate,authController.getCurrentUser);

router.put("/profile",authenticate,authController.updateProfile);

router.post("/forgot-password",authController.forgotPassword);

router.post("/reset-password/:token",authController.resetPassword);

module.exports = router;