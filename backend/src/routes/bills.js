const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const { validate, updateBillRules, billDetectionRules } = require('../middleware/validate');
const ctrl = require('../controllers/billController');

const router = Router();

router.get('/',              auth, ctrl.getBills);
router.post('/detect',       auth, billDetectionRules, validate, ctrl.detectBills);
router.get('/:id/history',   auth, ctrl.getBillHistory);
router.get('/:id',           auth, ctrl.getBill);
router.patch('/:id',         auth, updateBillRules, validate, ctrl.updateBill);

module.exports = router;
