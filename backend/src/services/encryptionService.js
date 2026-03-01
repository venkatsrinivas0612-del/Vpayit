const crypto = require('crypto');

const ALGORITHM   = 'aes-256-gcm';
const IV_BYTES    = 16;
const KEY_BYTES   = 32;

function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) throw new Error('ENCRYPTION_KEY environment variable is not set');
  const key = Buffer.from(hex, 'hex');
  if (key.length < KEY_BYTES) throw new Error('ENCRYPTION_KEY must be at least 32 bytes (64 hex chars)');
  return key.slice(0, KEY_BYTES);
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns: "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 */
function encrypt(plaintext) {
  const key = getKey();
  const iv  = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts a value produced by encrypt().
 */
function decrypt(encryptedValue) {
  const key = getKey();
  const parts = encryptedValue.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted value format');

  const [ivHex, authTagHex, ciphertext] = parts;
  const iv      = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
}

module.exports = { encrypt, decrypt };
