const { serviceClient } = require('../config/supabase');
const stripe = require('../services/stripeService');
const logger = require('../utils/logger');

/** POST /api/v1/billing/checkout — creates a Stripe Checkout session */
const createCheckout = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['pro', 'business'].includes(plan)) {
      return res.status(400).json({ error: 'plan must be pro or business', code: 'BAD_REQUEST' });
    }

    const session = await stripe.createCheckoutSession(req.user.id, plan, req.user.email);
    res.json({ url: session.url });
  } catch (err) { next(err); }
};

/** POST /api/v1/billing/portal — creates a Stripe Customer Portal session */
const createPortal = async (req, res, next) => {
  try {
    const { data: user, error } = await serviceClient
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single();

    if (error || !user?.stripe_customer_id) {
      return res.status(400).json({ error: 'No active subscription found', code: 'NO_SUBSCRIPTION' });
    }

    const session = await stripe.createPortalSession(user.stripe_customer_id);
    res.json({ url: session.url });
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/billing/webhook — Stripe webhook (no auth, raw body required)
 * Route must receive raw Buffer body — see billing route file.
 */
const handleWebhook = async (req, res, next) => {
  try {
    const sig   = req.headers['stripe-signature'];
    const event = stripe.constructWebhookEvent(req.body, sig);

    const result = await stripe.handleWebhook(event);
    logger.info('Stripe webhook processed', { type: event.type, result: result.event });

    if (result.event === 'checkout.completed') {
      await serviceClient
        .from('users')
        .update({ plan: result.plan, stripe_customer_id: result.stripeCustomerId })
        .eq('id', result.userId);
    }

    if (result.event === 'subscription.cancelled') {
      await serviceClient
        .from('users')
        .update({ plan: 'free' })
        .eq('stripe_customer_id', result.stripeCustomerId);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Webhook error', { message: err.message });
    // Return 400 so Stripe knows the event was rejected
    res.status(400).json({ error: err.message });
  }
};

/** GET /api/v1/billing/status — returns current plan for authenticated user */
const getBillingStatus = async (req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from('users')
      .select('plan, stripe_customer_id')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    res.json({
      plan:               data?.plan || 'free',
      hasSubscription:    !!data?.stripe_customer_id,
      stripeCustomerId:   data?.stripe_customer_id || null,
    });
  } catch (err) { next(err); }
};

module.exports = { createCheckout, createPortal, handleWebhook, getBillingStatus };
