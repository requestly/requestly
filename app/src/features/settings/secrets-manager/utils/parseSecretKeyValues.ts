export interface SecretKeyValue {
  key: string;
  value: string;
}

/**
 * Attempts to parse a secret's string value as a JSON object.
 * Returns an array of key-value pairs if the string is a valid JSON object,
 * or null if it's a plain string / array / primitive.
 */
export function parseSecretKeyValues(value: string | undefined): SecretKeyValue[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed).map(([k, v]) => ({ key: k, value: String(v) }));
    }
  } catch {
    // not JSON -- plain string secret
  }
  return null;
}
