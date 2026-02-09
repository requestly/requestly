import { createTransform } from "redux-persist";

/**
 * Recursively walks an object and converts Error instances to serializable plain objects
 */
function serializeErrors(obj: any): any {
  if (obj instanceof Error) {
    return {
      __isError: true,
      message: obj.message,
      name: obj.name,
      stack: obj.stack,
    };
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeErrors);
  }

  if (obj !== null && typeof obj === "object") {
    const serialized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeErrors(obj[key]);
      }
    }
    return serialized;
  }

  return obj;
}

/**
 * Redux-persist transform that automatically serializes Error instances for the workspaceView slice.
 *
 * **Why this is needed:**
 * - Error objects are not JSON-serializable (contain internal V8 metadata, getters/setters)
 * - Immer (used by Redux Toolkit) doesn't handle Error proxying well
 * - redux-persist crashes with "Internal error" when trying to serialize Errors to localStorage
 *
 * **How it works:**
 * 1. Before persistence: Error → `{ __isError: true, message, name, stack }`
 * 2. After rehydration: Plain object stays as-is
 * 3. Selectors check for `__isError` flag and reconstruct Error instances for consumers
 *
 * This follows the "parse at the boundaries" pattern - handle serialization at the
 * persistence boundary rather than changing domain types throughout the codebase.
 *
 * @see hooks.ts - selectSingleViewWorkspaceError reconstructs Errors from serialized format
 */
export const errorTransform = createTransform(
  // Inbound: serialize state before persisting
  (inboundState: any) => {
    return serializeErrors(inboundState);
  },
  // Outbound: deserialize state after rehydration
  (outboundState: any) => {
    // Keep as plain objects - selectors will reconstruct Errors when needed
    return outboundState;
  }
);
