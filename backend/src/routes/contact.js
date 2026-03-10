const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { submitContact } = require('../controllers/contactController');

const router = Router();

const contactRules = [
  body('name').isString().trim().isLength({ min: 1, max: 200 }).withMessage('name is required'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
  body('message').isString().trim().isLength({ min: 1, max: 5000 }).withMessage('message is required'),
  body('company').optional().isString().trim().isLength({ max: 200 }).withMessage('company must be under 200 characters'),
];

// Public — no auth middleware
router.post('/', contactRules, validate, submitContact);

module.exports = router;
