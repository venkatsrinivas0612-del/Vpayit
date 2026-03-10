/**
 * Lightweight structured logger.
 * Writes JSON lines to stdout/stderr so Railway can ingest them.
 */

const isDev = process.env.NODE_ENV === 'development';

function format(level, message, meta) {
  if (isDev) {
    const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
    return `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${metaStr}`;
  }
  return JSON.stringify({ ts: new Date().toISOString(), level, message, ...meta });
}

const logger = {
  info:  (msg, meta) => process.stdout.write(format('info',  msg, meta) + '\n'),
  warn:  (msg, meta) => process.stderr.write(format('warn',  msg, meta) + '\n'),
  error: (msg, meta) => process.stderr.write(format('error', msg, meta) + '\n'),
};

module.exports = logger;
