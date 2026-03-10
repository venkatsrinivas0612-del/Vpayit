const { Router } = require('express');
const { validate, contactRules } = require('../middleware/validate');
const { submitContact } = require('../controllers/contactController');

const router = Router();

// Public — no auth middleware
router.post('/', contactRules, validate, submitContact);

module.exports = router;
