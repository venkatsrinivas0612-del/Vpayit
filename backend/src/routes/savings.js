const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/savingsController');

const router = Router();

router.get('/',              auth, ctrl.getSavings);
router.post('/generate',     auth, ctrl.generateOpportunities);
router.patch('/:id',         auth, ctrl.updateStatus);

module.exports = router;
