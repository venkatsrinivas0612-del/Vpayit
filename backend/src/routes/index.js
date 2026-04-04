const { Router } = require('express');

const authRoutes          = require('./auth');
const bankRoutes          = require('./banks');
const billRoutes          = require('./bills');
const savingsRoutes       = require('./savings');
const transactionRoutes   = require('./transactions');
const notificationRoutes  = require('./notifications');
const reportRoutes        = require('./reports');
const contactRoutes       = require('./contact');
const quoteRoutes         = require('./quote');
const billingRoutes       = require('./billing');
const waitlistRoutes      = require('./waitlist');

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    service:   'Vpayit API',
    version:   'v1',
    endpoints: ['/auth', '/banks', '/bills', '/savings', '/transactions', '/notifications', '/reports', '/contact', '/billing', '/waitlist'],
  });
});

router.use('/auth',          authRoutes);
router.use('/banks',         bankRoutes);
router.use('/bills',         billRoutes);
router.use('/savings',       savingsRoutes);
router.use('/transactions',  transactionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports',       reportRoutes);
router.use('/contact',       contactRoutes);
router.use('/quote',         quoteRoutes);
router.use('/billing',       billingRoutes);
router.use('/waitlist',      waitlistRoutes);

module.exports = router;
