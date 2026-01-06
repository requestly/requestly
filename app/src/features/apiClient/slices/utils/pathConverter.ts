type PropertyKey = string | number;

export type PropertyPath = readonly PropertyKey[];

export interface SetOperation {
  readonly path: PropertyPath;
  readonly value: unknown;
}

function isNonEmptyRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length > 0;
}

export function isPathPresent(source: readonly PropertyPath[], element: PropertyPath) {
  const sourceSet = source.map(s => s.join('.'));
  const elementPath = element.join('.');
  const isPathPresent = sourceSet.some(s => elementPath.startsWith(`${s}.`) || s === elementPath);
  return isPathPresent;
}

/**
 * Converts a nested object structure to an array of SET operations.
 * Each non-null leaf value becomes a path-value pair for lodash.set().
 *
 * @example
 * objectToSetOperations({ data: { request: { url: "https://..." } } })
 * // Returns: [{ path: ["data", "request", "url"], value: "https://..." }]
 */
export function objectToSetOperations(obj: unknown): readonly SetOperation[] {
  const operations: SetOperation[] = [];

  const traverse = (current: unknown, path: PropertyPath): void => {
    if (isNonEmptyRecord(current)) {
      for (const key of Object.keys(current)) {
        traverse(current[key], [...path, key]);
      }
      return;
    }

    if (current !== null && current !== undefined) {
      operations.push({ path, value: current });
    }
  };

  traverse(obj, []);
  return operations;
}

/**
 * Converts a nested object with `null` values to an array of DELETE paths.
 * Each `null` value indicates a path to delete via lodash.unset().
 *
 * @example
 * objectToDeletePaths({ data: { auth: null } })
 * // Returns: [["data", "auth"]]
 */
export function objectToDeletePaths(obj: unknown): readonly PropertyPath[] {
  const paths: PropertyPath[] = [];

  const traverse = (current: unknown, path: PropertyPath): void => {
    if (isNonEmptyRecord(current)) {
      for (const key of Object.keys(current)) {
        traverse(current[key], [...path, key]);
      }
      return;
    }

    if (current === null) {
      paths.push([...path]);
    }
  };

  traverse(obj, []);
  return paths;
}
