const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/transactionController');

const router = Router();

router.get('/',         auth, ctrl.getTransactions);
router.get('/bills',    auth, ctrl.getBillTransactions);
router.get('/summary',  auth, ctrl.getSummary);

module.exports = router;
