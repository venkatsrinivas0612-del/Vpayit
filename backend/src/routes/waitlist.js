const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { joinWaitlist } = require('../controllers/waitlistController');

const router = Router();

const waitlistRules = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
  body('name').optional().isString().trim().isLength({ max: 200 }),
  body('path').optional().isIn(['starting', 'existing', '']),
  body('business_type').optional().isString().trim().isLength({ max: 100 }),
  body('source').optional().isString().trim().isLength({ max: 100 }),
];

router.post('/', waitlistRules, validate, joinWaitlist);

module.exports = router;
