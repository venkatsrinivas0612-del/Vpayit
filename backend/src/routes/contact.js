const { Router } = require('express');
const { submitContact } = require('../controllers/contactController');

const router = Router();

// Public — no auth middleware
router.post('/', submitContact);

module.exports = router;
