const { Router } = require('express');
const express = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/billingController');

const router = Router();

// ── Webhook — raw body BEFORE JSON parsing, no auth ───────
// express.raw overrides the global express.json() for this one route
router.post('/webhook', express.raw({ type: 'application/json' }), ctrl.handleWebhook);

// ── Authenticated billing routes ───────────────────────────
router.post('/checkout', auth, ctrl.createCheckout);
router.post('/portal',   auth, ctrl.createPortal);
router.get('/status',    auth, ctrl.getBillingStatus);

module.exports = router;
