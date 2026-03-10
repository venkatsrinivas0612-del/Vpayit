const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/savingsController');

const router = Router();

const updateStatusRules = [
  body('status').isIn(['viewed', 'applied', 'dismissed']).withMessage('status must be viewed, applied, or dismissed'),
];

router.get('/',              auth, ctrl.getSavings);
router.post('/generate',     auth, ctrl.generateOpportunities);
router.patch('/:id',         auth, updateStatusRules, validate, ctrl.updateStatus);

module.exports = router;
