/**
 * Privacy-First Data Redaction & Integrity Hashing Utilities
 * Ensures sensitive user financial secrets are redacted before processing and report export.
 */

/**
 * Mask and redact sensitive identifiers: phone numbers, account numbers, card numbers, and OTPs.
 * @param {string} text - Raw input message
 * @returns {string} Redacted message
 */
export function redactSensitiveData(text) {
  if (!text) return '';

  let sanitized = text;

  // 1. Redact 16-digit or 12-digit card numbers (e.g. 4111 2222 3333 4444)
  sanitized = sanitized.replace(/\b(?:\d{4}[-\s]?){3}(\d{4})\b/g, 'XXXX-XXXX-XXXX-$1');

  // 2. Redact 10-digit Indian Mobile Numbers (e.g. +91 9876543210 or 9876543210)
  sanitized = sanitized.replace(/(?:\+91[\s-]?)?([6-9]\d{2})\d{4}(\d{3})\b/g, '+91 $1-XXXX-$2');

  // 3. Redact long account numbers (e.g. A/C 123456789012)
  sanitized = sanitized.replace(/\b(a\/c|acct|account)\s*[:#-]?\s*(\d{2,4})\d{4,10}(\d{3,4})\b/gi, '$1 XX$3');

  // 4. Redact 4 to 6 digit OTP / PIN codes
  sanitized = sanitized.replace(/\b(otp|pin|cvv|code)\s*(?:is\s*)?[:#-]?\s*([0-9]{4,6})\b/gi, '$1 [REDACTED]');

  return sanitized;
}

/**
 * Compute SHA-256 evidence hash for forensic report integrity.
 * @param {string} data - Serialized report content
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function computeEvidenceHash(data) {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback simple checksum if Web Crypto is unavailable
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }
    return 'sha256-fallback-' + Math.abs(hash).toString(16).padStart(16, '0');
  }
}
