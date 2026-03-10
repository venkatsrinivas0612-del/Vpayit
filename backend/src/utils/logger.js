/**
 * Logger that only outputs in development mode.
 * In production all methods are no-ops to avoid leaking internals.
 */

const isDev = process.env.NODE_ENV === 'development';

function write(stream, level, message, meta) {
  if (!isDev) return;
  const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
  stream.write(`[${new Date().toISOString()}] ${level} ${message}${metaStr}\n`);
}

const logger = {
  info:  (msg, meta) => write(process.stdout, 'INFO ', msg, meta),
  warn:  (msg, meta) => write(process.stderr, 'WARN ', msg, meta),
  error: (msg, meta) => write(process.stderr, 'ERROR', msg, meta),
};

module.exports = logger;
