import { isPlainObject, forOwn, cloneDeep } from "lodash";

function isRecord(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) && !Array.isArray(value);
}

/**
 * Applies a diff object onto a target object.
 *
 * - null values in diff mean "delete this key"
 * - Nested objects are recursively merged
 * - Other values replace the target value
 *
 * @param target - The object to apply changes to (mutated in place)
 * @param diff - The diff to apply
 * @returns The mutated target
 */
export function applyDiff(target: Record<string, unknown>, diff: Record<string, unknown>): Record<string, unknown> {
  if (!isRecord(diff)) return target;

  forOwn(diff, (value, key) => {
    if (value === null) {
      delete target[key];
      return;
    }

    if (isRecord(value)) {
      const targetValue = target[key];
      if (!isRecord(targetValue)) {
        target[key] = {};
      }
      const targetRecord = target[key];
      if (isRecord(targetRecord)) {
        applyDiff(targetRecord, value);
      }
    } else {
      target[key] = cloneDeep(value);
    }
  });

  return target;
}
