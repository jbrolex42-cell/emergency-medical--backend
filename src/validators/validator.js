const { body, param, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

const normalizeKenyanPhone = (value) => {
  if (!value) return value;
  value = value.toString().trim();
  if (value.startsWith("0")) {
    return "+254" + value.substring(1);
  }
  if (value.startsWith("+254")) {
    return value;
  }
  // allow plain 9-digit starting with 7 (assume missing +254)
  if (/^7\d{8}$/.test(value)) {
    return "+254" + value;
  }
  throw new Error("Invalid Kenyan phone number format");
};

const authValidators = {

  register: [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
    body("firstName").notEmpty().withMessage("First name required"),
    body("lastName").notEmpty().withMessage("Last name required"),
    body("phone").optional().customSanitizer(normalizeKenyanPhone).custom(value=> {
      if (!/^\+2547\d{8}$/.test(value)) throw new Error("Invalid Kenyan phone number");
      return true;
    }),
    body("idNumber").optional().isLength({ min: 7, max: 8 }).isNumeric().withMessage("Invalid ID number"),
    handleValidationErrors
  ],

  login: [
    body("identifier").optional().notEmpty().withMessage("Email or phone required"),
    body("email").optional().isEmail(),
    body("phone").optional(),
    body("password").notEmpty().withMessage("Password required"),
    body().custom(value => {
      if (!value.email && !value.phone && !value.identifier) {
        throw new Error("Email, phone or identifier required");
      }
      return true;
    }),
    handleValidationErrors
  ]

};

const subscriptionValidators = {
  create: [
    body("plan").isIn(["basic","family","corporate"]).withMessage("Invalid subscription plan"),
    body("paymentMethod").isIn(["mpesa","bank","sha"]).withMessage("Invalid payment method"),
    handleValidationErrors
  ]
};

module.exports = {
  authValidators,
  subscriptionValidators,
  handleValidationErrors
};
