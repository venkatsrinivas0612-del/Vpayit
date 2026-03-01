const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/billController');

const router = Router();

router.get('/',         auth, ctrl.getBills);
router.post('/detect',  auth, ctrl.detectBills);
router.get('/:id',      auth, ctrl.getBill);
router.patch('/:id',    auth, ctrl.updateBill);

module.exports = router;
