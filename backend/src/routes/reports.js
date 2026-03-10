const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/reportController');

const router = Router();

router.get('/export', auth, ctrl.exportReport);

module.exports = router;
