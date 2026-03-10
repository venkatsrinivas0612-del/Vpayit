const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/billController');

const router = Router();

const updateBillRules = [
  body('status').optional().isIn(['active', 'cancelled', 'paused']).withMessage('status must be active, cancelled, or paused'),
  body('renewal_date').optional().isISO8601().withMessage('renewal_date must be a valid date (YYYY-MM-DD)'),
  body('next_due_date').optional().isISO8601().withMessage('next_due_date must be a valid date (YYYY-MM-DD)'),
  body('frequency').optional().isIn(['weekly', 'monthly', 'quarterly', 'annual']).withMessage('frequency must be weekly, monthly, quarterly, or annual'),
];

router.get('/',              auth, ctrl.getBills);
router.post('/detect',       auth, ctrl.detectBills);
router.get('/:id/history',   auth, ctrl.getBillHistory);
router.get('/:id',           auth, ctrl.getBill);
router.patch('/:id',         auth, updateBillRules, validate, ctrl.updateBill);

module.exports = router;
