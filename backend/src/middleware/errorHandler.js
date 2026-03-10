/**
 * Central error handler — must be registered last in Express middleware chain.
 */
const logger = require('../utils/logger');

const STATUS_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
};

function errorHandler(err, req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development';
  const status = err.statusCode || err.status || 500;

  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    status,
    ...(isDev && { stack: err.stack }),
  });

  const message = err.expose !== false ? err.message : 'Internal server error';
  const code = STATUS_CODES[status] || 'INTERNAL_ERROR';

  res.status(status).json({
    error: message,
    code,
    status,
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
