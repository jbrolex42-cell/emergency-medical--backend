const { body, param, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array()
    });
  }

  next();
};

// Kenyan phone regex
const kenyanPhoneRegex = /^(?:\+254|0)(7\d{8})$/;

const authValidators = {

  register: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain uppercase, lowercase and number"),

    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),

    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required"),

    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required"),

    body("phone")
      .matches(kenyanPhoneRegex)
      .withMessage("Valid Kenyan phone number required"),

    body("idNumber")
      .isLength({ min: 7, max: 8 })
      .isNumeric()
      .withMessage("Valid Kenyan ID number required"),

    body("county")
      .optional()
      .isString()
      .withMessage("County must be a valid string"),

    handleValidationErrors
  ],

  login: [
    body("password")
      .notEmpty()
      .withMessage("Password is required"),

    body().custom(value => {
      if (!value.email && !value.phone && !value.identifier) {
        throw new Error("Email, phone or identifier required");
      }
      return true;
    }),

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
    param("id")
      .isUUID()
      .withMessage("Valid emergency ID required"),

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
