require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

const logger = require('./src/utils/logger');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

// ── Env validation (TrueLayer vars — Supabase/core vars checked in config/supabase.js) ──
const REQUIRED_TRUELAYER = ['TRUELAYER_CLIENT_ID', 'TRUELAYER_CLIENT_SECRET', 'TRUELAYER_REDIRECT_URI'];
const missingTL = REQUIRED_TRUELAYER.filter(k => !process.env[k]);
if (missingTL.length) {
  missingTL.forEach(k => logger.error(`Missing required env var: ${k}`));
  process.exit(1);
}

const app = express();

// ── Security headers ─────────────────────────────────────
app.use(helmet());

// ── Compression ───────────────────────────────────────────
app.use(compression());

// ── Request logging (dev only) ────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── CORS ─────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://app.vpayit.co.uk',
  'https://vpayit.co.uk',
  'https://moonlit-gelato-dd1708.netlify.app',
  process.env.FRONTEND_URL,          // additional origin from env if needed
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server requests (no origin) and listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts — please try again later.' },
});

app.use('/api/', globalLimiter);
app.use('/api/v1/auth', authLimiter);

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────
app.get('/health', async (_req, res) => {
  const { serviceClient } = require('./src/config/supabase');
  let db = 'connected';
  try {
    const { error } = await serviceClient.from('suppliers').select('id').limit(1);
    if (error) db = 'error';
  } catch {
    db = 'error';
  }
  const status = db === 'connected' ? 'ok' : 'degraded';
  res.status(db === 'connected' ? 200 : 503).json({
    status,
    db,
    uptime: process.uptime(),
  });
});

// ── API routes ────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Vpayit API running on http://localhost:${PORT}`, { env: process.env.NODE_ENV || 'development' });
});

module.exports = app;
