const { body, param, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array()
    });
  }

  next();
};

const kenyanPhoneRegex = /^(?:\+254|0)(7\d{8})$/;


const authValidators = {

  register: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),

    body("password")
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain uppercase, lowercase and number"),

    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name required"),

    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name required"),

    body("phone")
      .matches(kenyanPhoneRegex)
      .withMessage("Valid Kenyan phone number required"),

    body("idNumber")
      .isLength({ min: 7, max: 8 })
      .isNumeric()
      .withMessage("Valid Kenyan ID number required"),

    handleValidationErrors
  ],

  login: [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
    handleValidationErrors
  ]
};


const emergencyValidators = {

  create: [
    body("type")
      .isIn([
        "medical",
        "trauma",
        "maternal",
        "cardiac",
        "respiratory",
        "other"
      ])
      .withMessage("Valid emergency type required"),

    body("severity")
      .isIn([
        "critical",
        "urgent",
        "moderate",
        "minor"
      ])
      .withMessage("Severity level required"),

    body("location")
      .isObject()
      .withMessage("Location object required"),

    body("location.latitude")
      .isFloat({ min: -5, max: 5.5 })
      .withMessage("Valid latitude required"),

    body("location.longitude")
      .isFloat({ min: 33, max: 42 })
      .withMessage("Valid longitude required"),

    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description max 500 characters"),

    handleValidationErrors
  ],

  updateStatus: [
    param("id").isUUID().withMessage("Valid emergency ID required"),

    body("status")
      .isIn([
        "pending",
        "dispatched",
        "en_route",
        "on_scene",
        "transporting",
        "completed",
        "cancelled"
      ])
      .withMessage("Valid status required"),

    handleValidationErrors
  ]
};

const subscriptionValidators = {

  create: [
    body("plan")
      .isIn(["basic", "family", "corporate"])
      .withMessage("Valid subscription plan required"),

    body("paymentMethod")
      .isIn(["mpesa", "bank", "sha"])
      .withMessage("Valid payment method required"),

    handleValidationErrors
  ]
};

module.exports = {
  authValidators,
  emergencyValidators,
  subscriptionValidators,
  handleValidationErrors
};