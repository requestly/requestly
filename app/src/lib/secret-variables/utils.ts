import { get } from "lodash";
import { VariableScope } from "@requestly/shared/types/entities/apiClient";
import { SecretVariable, SecretVariableTree } from "./types";

/**
 * Gets a value from the secrets tree using dot notation path.
 * Uses lodash.get for path traversal.
 */
export function getValueByPath(obj: SecretVariableTree, path: string) {
  return get(obj, path);
}

/**
 * Returns true if the value is a SecretVariable (leaf node).
 * Nested objects that contain more variables are not considered resolvable.
 */
export function isResolvableLeaf(value: SecretVariableTree | SecretVariable): boolean {
  if (value == null || typeof value !== "object") {
    return false;
  }

  return value.scope === VariableScope.SECRETS && typeof value.value === "string";
}

/**
 * Recursively flattens a SecretVariableTree into an array of SecretVariables.
 * Only leaf SecretVariable nodes are included; intermediate nested objects are traversed.
 */
export function flattenToLeafPaths(obj: SecretVariableTree, prefix = ""): SecretVariable[] {
  const result: SecretVariable[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value != null && typeof value === "object") {
      if (isResolvableLeaf(value)) {
        // This is a leaf SecretVariable - add it to results
        result.push({
          ...(value as SecretVariable),
          name: path, // Use the full dotted path as name
          id: path, // Use the full dotted path as id
        });
      } else {
        // This is a nested object - recurse into it
        result.push(...flattenToLeafPaths(value as SecretVariableTree, path));
      }
    }
  }

  return result;
}
