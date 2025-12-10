import { isPlainObject, forOwn, cloneDeep } from "lodash";

export function applyDiff<T extends Record<string, unknown>>(target: T, diff: Record<string, unknown>): T {
  if (!isPlainObject(diff)) return target;

  forOwn(diff, (value, key) => {
    if (value === null) {
      delete (target as Record<string, unknown>)[key];
      return;
    }

    if (isPlainObject(value) && !Array.isArray(value)) {
      if (!isPlainObject((target as Record<string, unknown>)[key])) {
        (target as Record<string, unknown>)[key] = {};
      }
      applyDiff((target as Record<string, unknown>)[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      (target as Record<string, unknown>)[key] = cloneDeep(value);
    }
  });

  return target;
}
