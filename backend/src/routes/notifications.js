const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/notificationController');

const router = Router();

router.post('/bill-reminders',  auth,  ctrl.getBillReminders);
router.post('/send-reminders',  admin, ctrl.sendReminders);

module.exports = router;
