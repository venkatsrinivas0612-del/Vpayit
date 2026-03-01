const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/authController');

const router = Router();

router.post('/profile', auth, ctrl.upsertProfile);
router.get('/me',       auth, ctrl.getProfile);
router.patch('/me',     auth, ctrl.updateProfile);

module.exports = router;
