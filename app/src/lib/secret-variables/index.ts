import { VariableScope } from "../../backend/environment/types";
import { SecretVariable, SecretVariableTree } from "./types";
import { getValueByPath, isResolvableLeaf, flattenToLeafPaths } from "./utils";

const SECRETS_PREFIX = "secrets.";

/**
 * Source of secret values. Can be wired to Redux, a vault client, or any sync lookup.
 * Supports nested objects; use dot paths in templates (e.g. {{secrets.cities.chicago}}).
 */
export type SecretsSource = () => SecretVariableTree;

let secretsSource: SecretsSource = () => ({
  apple: { name: "apple", value: "red", id: "apple", scope: VariableScope.SECRETS },
  banana: { name: "banana", value: "yellow", id: "banana", scope: VariableScope.SECRETS },
  cherry: { name: "cherry", value: "red", id: "cherry", scope: VariableScope.SECRETS },
  cities: {
    newYork: { name: "newYork", value: "New York", id: "newYork", scope: VariableScope.SECRETS },
    losAngeles: { name: "losAngeles", value: "Los Angeles", id: "losAngeles", scope: VariableScope.SECRETS },
    chicago: { name: "chicago", value: "Chicago", id: "chicago", scope: VariableScope.SECRETS },
  },
});

/**
 * Set the source for {{secrets.<path>}} template variables.
 * Call at app init with a function that returns the current secrets map.
 */
export function setSecretsSource(source: SecretsSource): void {
  secretsSource = source;
}

/**
 * Returns the current secrets map. Used when building Handlebars context.
 * Transforms SecretVariableTree into a simple nested object with just values.
 * Example: { apple: "red", cities: { newYork: "New York" } }
 */
export function getSecrets(): Record<string, unknown> {
  const tree = secretsSource();
  return transformTreeToValues(tree);
}

/**
 * Recursively transforms a SecretVariableTree into a plain object with just values.
 */
function transformTreeToValues(tree: SecretVariableTree): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(tree)) {
    if (value != null && typeof value === "object") {
      if (isResolvableLeaf(value)) {
        // This is a leaf SecretVariable - extract just the value
        result[key] = value.value;
      } else {
        // This is a nested object - recurse into it
        result[key] = transformTreeToValues(value as SecretVariableTree);
      }
    }
  }

  return result;
}

/**
 * Returns true only if fullPath is "secrets.xxx.yyy" and the path xxx.yyy
 * exists in the secrets object and is a leaf value.
 * Intermediate objects (e.g. secrets.cities) return false.
 */
export function hasSecretsPath(fullPath: string): boolean {
  if (!fullPath.startsWith(SECRETS_PREFIX)) {
    return false;
  }

  const path = fullPath.slice(SECRETS_PREFIX.length);
  if (!path) {
    return false;
  }

  const value = getValueByPath(secretsSource(), path);
  return isResolvableLeaf(value);
}

/**
 * Lists all leaf secret paths for autocomplete/popover.
 * Each name is the full template path (e.g. "secrets.cities.chicago").
 */
export function getSecretsList(): SecretVariable[] {
  const entries = flattenToLeafPaths(secretsSource());
  return entries.map((e) => ({
    name: `${SECRETS_PREFIX}${e.name}`,
    value: e.value,
    id: `${SECRETS_PREFIX}${e.id}`,
    scope: VariableScope.SECRETS,
  }));
}

/**
 * Returns the secrets list entry for a given full path, or undefined.
 */
export function getSecretsVariable(name: string): SecretVariable | undefined {
  if (!hasSecretsPath(name)) {
    return undefined;
  }

  const path = name.slice(SECRETS_PREFIX.length);
  const entries = flattenToLeafPaths(secretsSource());
  const found = entries.find((e) => e.name === path);

  if (!found) {
    return undefined;
  }
  console.log("!!!debug", "found", found);

  return {
    name: `${SECRETS_PREFIX}${found.name}`,
    value: found.value,
    id: `${SECRETS_PREFIX}${found.id}`,
    scope: VariableScope.SECRETS,
  };
}
