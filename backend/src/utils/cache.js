/**
 * Simple in-memory Map-based cache with per-entry TTL.
 * Not shared across processes — suitable for single-instance Railway deploys.
 */

const store = new Map();

const cache = {
  /**
   * Retrieve a cached value. Returns undefined if missing or expired.
   * @param {string} key
   */
  get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  },

  /**
   * Store a value with a TTL.
   * @param {string} key
   * @param {*}      value
   * @param {number} ttlMs  Time-to-live in milliseconds
   */
  set(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  /**
   * Evict a single key.
   * @param {string} key
   */
  delete(key) {
    store.delete(key);
  },

  /** Evict all entries. */
  clear() {
    store.clear();
  },
};

module.exports = cache;
