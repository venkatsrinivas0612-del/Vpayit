/**
 * Central error handler — must be registered last in Express middleware chain.
 */
function errorHandler(err, req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    message: err.message,
    ...(isDev && { stack: err.stack }),
  });

  const status = err.statusCode || err.status || 500;
  const message = err.expose !== false ? err.message : 'Internal server error';

  res.status(status).json({
    error: message,
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
