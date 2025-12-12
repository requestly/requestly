import { isPlainObject, isEqual, forOwn, isEmpty } from "lodash";

function isRecord(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) && !Array.isArray(value);
}

/**
 * Computes the deep difference between two objects.
 *
 * - Changed values are included as-is
 * - Nested objects are recursively diffed
 * - Deleted keys (present in original but missing in new) are marked with `null`
 * - Arrays are compared by value equality (not merged)
 *
 * @param newData - The new state of the object
 * @param originalData - The original state to compare against
 * @returns An object containing only the differences
 */
export function getDeepDiff(
  newData: Record<string, unknown>,
  originalData: Record<string, unknown>
): Record<string, unknown> {
  const diff: Record<string, unknown> = {};

  forOwn(newData, (value, key) => {
    const originalValue = originalData[key];

    if (!isEqual(value, originalValue)) {
      if (isRecord(value) && isRecord(originalValue)) {
        const nestedDiff = getDeepDiff(value, originalValue);
        if (!isEmpty(nestedDiff)) {
          diff[key] = nestedDiff;
        }
      } else {
        diff[key] = value;
      }
    }
  });

  // Detect deleted keys: present in original but missing in new
  // Uses hasOwnProperty to distinguish "key removed" from "key set to undefined"
  forOwn(originalData, (_, key) => {
    if (!Object.prototype.hasOwnProperty.call(newData, key)) {
      diff[key] = null;
    }
  });

  return diff;
}
