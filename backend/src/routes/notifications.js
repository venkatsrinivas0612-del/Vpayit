const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notificationController');

const router = Router();

router.post('/bill-reminders', auth, ctrl.getBillReminders);

module.exports = router;
