const logger = require('../utils/logger');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  logger.warn('STRIPE_SECRET_KEY not set — billing endpoints are disabled');
}

const FRONTEND = process.env.FRONTEND_URL || 'https://app.vpayit.co.uk';

const PRICES = {
  pro:      process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

function requireStripe() {
  if (!stripe) throw Object.assign(new Error('Billing is not configured'), { statusCode: 503, expose: true });
}

/**
 * Creates a Stripe Checkout session for a subscription plan.
 * @param {string} userId   Supabase user ID (stored as client_reference_id)
 * @param {string} planId   'pro' | 'business'
 * @param {string} email    Customer email (pre-fills Stripe checkout form)
 */
async function createCheckoutSession(userId, planId, email) {
  requireStripe();

  const priceId = PRICES[planId];
  if (!priceId) throw Object.assign(new Error(`Unknown plan: ${planId}`), { statusCode: 400, expose: true });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${FRONTEND}/settings?payment=success`,
    cancel_url:  `${FRONTEND}/pricing`,
  });

  return session;
}

/**
 * Creates a Stripe Customer Portal session so the user can manage their subscription.
 * @param {string} customerId  Stripe customer ID stored in users table
 */
async function createPortalSession(customerId) {
  requireStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer:   customerId,
    return_url: `${FRONTEND}/settings`,
  });

  return session;
}

/**
 * Verifies and constructs a Stripe webhook event from the raw request body.
 * @param {Buffer} rawBody
 * @param {string} signature  Value of the `stripe-signature` header
 */
function constructWebhookEvent(rawBody, signature) {
  requireStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw Object.assign(new Error('STRIPE_WEBHOOK_SECRET not configured'), { statusCode: 503, expose: true });
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

/**
 * Processes a verified Stripe webhook event.
 * Returns { plan, stripeCustomerId, userId } for checkout.session.completed,
 * or { userId } for subscription cancellation.
 * @param {object} event  Verified Stripe event object
 */
async function handleWebhook(event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId  = session.client_reference_id;

      // Determine which plan was purchased from the subscription line items
      let plan = 'pro';
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription, {
          expand: ['items.data.price'],
        });
        const priceId = sub.items.data[0]?.price?.id;
        if (priceId === PRICES.business) plan = 'business';
      }

      return {
        event:            'checkout.completed',
        userId,
        plan,
        stripeCustomerId: session.customer,
      };
    }

    case 'customer.subscription.deleted': {
      const sub      = event.data.object;
      const customer = sub.customer;

      return {
        event:            'subscription.cancelled',
        stripeCustomerId: customer,
      };
    }

    default:
      return { event: 'unhandled', type: event.type };
  }
}

module.exports = { createCheckoutSession, createPortalSession, constructWebhookEvent, handleWebhook };
