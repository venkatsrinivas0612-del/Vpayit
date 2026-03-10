const { validationResult } = require('express-validator');

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
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
