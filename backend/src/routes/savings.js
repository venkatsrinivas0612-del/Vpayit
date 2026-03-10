const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const { validate, updateSavingsStatusRules } = require('../middleware/validate');
const ctrl = require('../controllers/savingsController');

const router = Router();

router.get('/',              auth, ctrl.getSavings);
router.post('/generate',     auth, ctrl.generateOpportunities);
router.patch('/:id',         auth, updateSavingsStatusRules, validate, ctrl.updateStatus);

module.exports = router;
