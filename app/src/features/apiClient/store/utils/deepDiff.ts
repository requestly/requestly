import { isPlainObject, isEqual, forOwn, isEmpty } from "lodash";

export function getDeepDiff<T extends Record<string, unknown>>(newData: T, originalData: T): Record<string, unknown> {
  const diff: Record<string, unknown> = {};

  forOwn(newData, (value, key) => {
    const originalValue = originalData[key];

    if (!isEqual(value, originalValue)) {
      if (isPlainObject(value) && isPlainObject(originalValue) && !Array.isArray(value)) {
        const nestedDiff = getDeepDiff(value as Record<string, unknown>, originalValue as Record<string, unknown>);
        if (!isEmpty(nestedDiff)) {
          diff[key] = nestedDiff;
        }
      } else {
        diff[key] = value;
      }
    }
  });

  forOwn(originalData, (_, key) => {
    if (newData[key] === undefined) {
      diff[key] = null;
    }
  });

  return diff;
}
