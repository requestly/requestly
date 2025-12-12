type PropertyKey = string | number;

interface SetOperation {
  readonly path: readonly PropertyKey[];
  readonly value: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Converts a nested object structure to an array of SET operations.
 * Each leaf value becomes a path-value pair for lodash.set().
 *
 * - Leaf values (primitives, arrays) become path-value pairs
 * - Objects are traversed recursively
 * - null values are skipped (handled separately as deletions)
 *
 * @example
 * objectToSetOperations({ data: { request: { url: "https://..." } } })
 * // Returns: [{ path: ["data", "request", "url"], value: "https://..." }]
 */
export function objectToSetOperations(obj: unknown): readonly SetOperation[] {
  const operations: SetOperation[] = [];

  const traverse = (current: unknown, path: readonly PropertyKey[]): void => {
    if (current === null || current === undefined) {
      return;
    }

    if (Array.isArray(current)) {
      operations.push({ path, value: current });
      return;
    }

    if (!isRecord(current)) {
      operations.push({ path, value: current });
      return;
    }

    const keys = Object.keys(current);

    if (keys.length === 0) {
      operations.push({ path, value: current });
      return;
    }

    for (const key of keys) {
      traverse(current[key], [...path, key]);
    }
  };

  traverse(obj, []);
  return operations;
}

/**
 * Converts a nested object with `true` markers to an array of DELETE paths.
 * Each `true` value indicates a path to delete via lodash.unset().
 *
 * @example
 * objectToDeletePaths({ data: { auth: true } })
 * // Returns: [["data", "auth"]]
 */
export function objectToDeletePaths(obj: unknown): readonly (readonly PropertyKey[])[] {
  const paths: PropertyKey[][] = [];

  const traverse = (current: unknown, path: readonly PropertyKey[]): void => {
    if (current === true) {
      paths.push([...path]);
      return;
    }

    if (!isRecord(current)) {
      return;
    }

    for (const key of Object.keys(current)) {
      traverse(current[key], [...path, key]);
    }
  };

  traverse(obj, []);
  return paths;
}
