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

      const bytes = new Uint8Array(keys.length);

      for (let i = 0; i < keys.length; i++) {
        const v = obj[i];
        if (typeof v !== "number" || v < 0 || v > 255) return false;
        bytes[i] = v;
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
