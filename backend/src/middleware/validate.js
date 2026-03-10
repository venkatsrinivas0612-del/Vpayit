const { body, validationResult } = require('express-validator');

/**
 * Run after express-validator chains.
 * Returns 422 with standardised shape if any validation errors exist.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      status: 422,
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// ── Reusable rule sets ────────────────────────────────────

const registrationRules = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const contactRules = [
  body('name').isString().trim().isLength({ min: 1, max: 200 }).withMessage('name is required'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
  body('message').isString().trim().isLength({ min: 1, max: 5000 }).withMessage('message is required'),
  body('company').optional().isString().trim().isLength({ max: 200 }).withMessage('company must be under 200 characters'),
];

const billDetectionRules = [
  body('from').optional().isISO8601().withMessage('from must be a valid date (YYYY-MM-DD)'),
  body('to').optional().isISO8601().withMessage('to must be a valid date (YYYY-MM-DD)'),
];

const profileRules = [
  body('business_name').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('business_name must be 1–200 characters'),
  body('business_type').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('business_type must be 1–100 characters'),
  body('postcode').optional().isString().trim().isLength({ min: 2, max: 10 }).withMessage('postcode must be 2–10 characters'),
];

const updateBillRules = [
  body('status').optional().isIn(['active', 'cancelled', 'paused']).withMessage('status must be active, cancelled, or paused'),
  body('renewal_date').optional().isISO8601().withMessage('renewal_date must be a valid date (YYYY-MM-DD)'),
  body('next_due_date').optional().isISO8601().withMessage('next_due_date must be a valid date (YYYY-MM-DD)'),
  body('frequency').optional().isIn(['weekly', 'monthly', 'quarterly', 'annual']).withMessage('frequency must be weekly, monthly, quarterly, or annual'),
];

const updateSavingsStatusRules = [
  body('status').isIn(['viewed', 'applied', 'dismissed']).withMessage('status must be viewed, applied, or dismissed'),
];

module.exports = {
  validate,
  registrationRules,
  loginRules,
  contactRules,
  billDetectionRules,
  profileRules,
  updateBillRules,
  updateSavingsStatusRules,
};
