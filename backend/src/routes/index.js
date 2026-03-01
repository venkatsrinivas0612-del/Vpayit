const { Router } = require('express');

const authRoutes        = require('./auth');
const bankRoutes        = require('./banks');
const billRoutes        = require('./bills');
const savingsRoutes     = require('./savings');
const transactionRoutes = require('./transactions');

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    service:   'Vpayit API',
    version:   'v1',
    endpoints: ['/auth', '/banks', '/bills', '/savings', '/transactions'],
  });
});

router.use('/auth',         authRoutes);
router.use('/banks',        bankRoutes);
router.use('/bills',        billRoutes);
router.use('/savings',      savingsRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
