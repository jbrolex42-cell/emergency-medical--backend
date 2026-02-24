const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

const authValidators = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('phone')
      .matches(/^\+?254[0-9]{9}$/)
      .withMessage('Valid Kenyan phone number required (e.g., +254712345678)'),
    body('idNumber')
      .matches(/^[0-9]{8}$/)
      .withMessage('Valid Kenyan ID number required (8 digits)'),
    handleValidationErrors
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    handleValidationErrors
  ]
};

const emergencyValidators = {
  create: [
    body('type')
      .isIn(['medical', 'trauma', 'maternal', 'cardiac', 'respiratory', 'other'])
      .withMessage('Valid emergency type required'),
    body('severity')
      .isIn(['critical', 'urgent', 'moderate', 'minor'])
      .withMessage('Severity level required'),
    body('location')
      .isObject()
      .withMessage('Location object required'),
    body('location.latitude')
      .isFloat({ min: -5, max: 5 })
      .withMessage('Valid latitude required'),
    body('location.longitude')
      .isFloat({ min: 33, max: 42 })
      .withMessage('Valid longitude required'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description max 500 characters'),
    handleValidationErrors
  ],
  updateStatus: [
    param('id').isUUID().withMessage('Valid emergency ID required'),
    body('status')
      .isIn(['pending', 'dispatched', 'en_route', 'on_scene', 'transporting', 'completed', 'cancelled'])
      .withMessage('Valid status required'),
    handleValidationErrors
  ]
};

const subscriptionValidators = {
  create: [
    body('plan')
      .isIn(['basic', 'family', 'corporate'])
      .withMessage('Valid subscription plan required'),
    body('paymentMethod')
      .isIn(['mpesa', 'bank', 'sha'])
      .withMessage('Valid payment method required'),
    handleValidationErrors
  ]
};

module.exports = {
  authValidators,
  emergencyValidators,
  subscriptionValidators,
  handleValidationErrors
};