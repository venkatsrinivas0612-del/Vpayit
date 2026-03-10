const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const { validate, profileRules } = require('../middleware/validate');
const ctrl = require('../controllers/authController');

const router = Router();

router.post('/profile', auth, profileRules, validate, ctrl.upsertProfile);
router.get('/me',       auth, ctrl.getProfile);
router.patch('/me',     auth, profileRules, validate, ctrl.updateProfile);

module.exports = router;
