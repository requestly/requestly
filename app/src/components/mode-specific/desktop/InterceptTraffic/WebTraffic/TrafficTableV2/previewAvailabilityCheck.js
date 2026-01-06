/**
 * Returns true ONLY if the body is safe to render in CodeMirror.
 * Guarantees:
 * - No editor crashes
 * - No UI freezes
 * - No binary garbage rendering
 */
export function canPreviewAsText(body) {
  // ---------- BASIC SANITY ----------
  if (typeof body !== "string" || body.length === 0) return false;

  // ---------- HARD SIZE LIMIT ----------
  // CodeMirror becomes unstable beyond this
  if (body.length > 5_000_000) return false; // ~5MB

  let text = body;

  // ---------- BYTE-MAP JSON (fonts/images sent as {0:123}) ----------
  // Example: {"0":60,"1":115,...}
  if (body[0] === "{" && body.length < 1_000_000 && /"\d+"\s*:\s*\d+/.test(body)) {
    try {
      const obj = JSON.parse(body);
      const keys = Object.keys(obj);

      // Reject sparse or insane maps
      if (keys.length === 0 || keys.length > 500_000) return false;

      // Parse keys as numeric indices and validate
      const numericKeys = [];
      let maxIndex = -1;

      for (const key of keys) {
        const index = parseInt(key, 10);
        // Validate key is a non-negative integer
        if (!Number.isInteger(index) || index < 0 || index.toString() !== key) {
          return false;
        }
        numericKeys.push(index);
        if (index > maxIndex) maxIndex = index;
      }

      // Compute needed length as (maxIndex + 1)
      const length = maxIndex + 1;
      if (length > 500_000) return false; // Safety check

      const bytes = new Uint8Array(length);

      // Iterate numeric keys and validate values
      for (const index of numericKeys) {
        const value = obj[index.toString()];
        // Validate value is a number 0-255
        if (typeof value !== "number" || value < 0 || value > 255 || !Number.isInteger(value)) {
          return false;
        }
        bytes[index] = value;
      }

      text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch {
      return false;
    }
  }

  // ---------- NULL BYTE DETECTION ----------
  // Binary ALWAYS contains null bytes
  if (text.indexOf("\u0000") !== -1) return false;

  // ---------- CONTROL CHARACTER DENSITY ----------
  // Binary has many non-printable chars
  let controlCount = 0;
  const scanLimit = Math.min(text.length, 10_000);

  for (let i = 0; i < scanLimit; i++) {
    const code = text.charCodeAt(i);
    if (code < 9 || (code > 13 && code < 32)) {
      controlCount++;
      if (controlCount > 100) return false;
    }
  }

  // ---------- BASE64 BLOB DETECTION ----------
  // Prevent rendering encoded binaries
  if (text.length > 800 && /^[A-Za-z0-9+/=\r\n]+$/.test(text.slice(0, 1000))) {
    return false;
  }

  // ---------- PRINTABLE RATIO ----------
  // Text must contain enough readable characters
  let printable = 0;
  for (let i = 0; i < scanLimit; i++) {
    const c = text.charCodeAt(i);
    if (c >= 32 && c <= 126) printable++;
  }

  if (printable / scanLimit < 0.6) return false;

  return true;
}
