const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/authController');

const router = Router();

const profileRules = [
  body('business_name').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('business_name must be 1–200 characters'),
  body('business_type').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('business_type must be 1–100 characters'),
  body('postcode').optional().isString().trim().isLength({ min: 2, max: 10 }).withMessage('postcode must be 2–10 characters'),
];

router.post('/profile', auth, profileRules, validate, ctrl.upsertProfile);
router.get('/me',       auth, ctrl.getProfile);
router.patch('/me',     auth, profileRules, validate, ctrl.updateProfile);

module.exports = router;
