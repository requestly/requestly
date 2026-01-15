export const minifyCode = (value) => {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch (e) {
    return value;
  }
};

export const formatJSONString = async (value, tabSize = 0) => {
  const prettier = await import("prettier");
  const parserBabel = await import("prettier/parser-babel");

  try {
    return JSON.stringify(JSON.parse(value), null, tabSize); //convert string to JSON if in correct JSON format
  } catch (e) {
    try {
      const formattedCode = prettier.format(value, {
        // converts JS object to JSON
        parser: "json",
        plugins: [parserBabel],
      });
      return JSON.stringify(JSON.parse(formattedCode), null, tabSize);
    } catch {
      return value; // value can also be string
    }
  }
};

// Added 5MB cap to maintain the stability and responsiveness of the app
const MAX_PREVIEW_SIZE = 5 * 1024 * 1024; // 5 MB

// Regex to match previewable MIME types
const PREVIEWABLE_MIME_TYPES_REGEX = new RegExp(
  [
    "^text/.*", // All text/* types (HTML, plain, CSS, etc.)
    "^application/javascript", // JavaScript (standard)
    "^application/x-javascript", // JavaScript (legacy)
    "^application/json", // JSON data
    "^application/xml", // XML data
    "^application/.*\\+json$", // Vendor-specific JSON (e.g., application/vnd.api+json)
    "^application/.*\\+xml$", // Vendor-specific XML (e.g., application/vnd.api+xml)
  ].join("|"),
  "i"
);

export function shouldRenderPreview(body, contentType) {
  if (!body || !contentType) return false;
  // Size check
  const sizeInBytes = new TextEncoder().encode(body).length;
  if (sizeInBytes > MAX_PREVIEW_SIZE) return false;
  // Binary check
  if (body.includes("\0")) return false;
  // Extract and normalize MIME type
  const mime = contentType.split(";")[0].trim().toLowerCase();
  // Use regex to match previewable MIME types
  return PREVIEWABLE_MIME_TYPES_REGEX.test(mime);
}
