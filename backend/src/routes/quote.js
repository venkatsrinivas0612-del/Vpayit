const { Router } = require('express');
const { validate, quoteRules } = require('../middleware/validate');
const { submitQuote } = require('../controllers/quoteController');

const router = Router();

// Public — no auth required
router.post('/', quoteRules, validate, submitQuote);

module.exports = router;
