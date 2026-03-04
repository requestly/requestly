import { VariableScope } from "../../backend/environment/types";
import { SecretVariable, SecretVariableTree } from "./types";
import { getValueByPath, isResolvableLeaf, flattenToLeafPaths } from "./utils";
import { AwsSecretValue } from "@requestly/shared/types/entities/secretsManager";

const SECRETS_PREFIX = "secrets.";

export type SecretsSource = () => SecretVariableTree;

/**
 * Recursively transforms a SecretVariableTree into a plain object with just values.
 */
function transformTreeToValues(tree: SecretVariableTree): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(tree)) {
    if (value != null && typeof value === "object") {
      if (isResolvableLeaf(value)) {
        result[key] = (value as SecretVariable).value;
      } else {
        result[key] = transformTreeToValues(value as SecretVariableTree);
      }
    }
  }

  return result;
}

export class SecretVariablesService {
  private source: SecretsSource = () => ({});

  setSource(source: SecretsSource): void {
    this.source = source;
  }

  private buildSourceFromAwsSecrets(secrets: AwsSecretValue[]): SecretVariableTree {
    const tree: SecretVariableTree = {};

    for (const secret of secrets) {
      const alias = secret.secretReference.alias;
      if (!alias) continue;

      let parsed: Record<string, unknown> | null = null;
      try {
        const result = JSON.parse(secret.value);
        if (result && typeof result === "object" && !Array.isArray(result)) {
          parsed = result as Record<string, unknown>;
        }
      } catch {
        // plain string secret
      }

      if (parsed) {
        const nested: { [key: string]: SecretVariable } = {};
        for (const [k, v] of Object.entries(parsed)) {
          nested[k] = { name: k, value: String(v), id: k, scope: VariableScope.SECRETS };
        }
        tree[alias] = nested;
      } else {
        tree[alias] = { name: alias, value: secret.value, id: alias, scope: VariableScope.SECRETS };
      }
    }

    return tree;
  }

  updateSourceFromSecrets(secrets: AwsSecretValue[]): void {
    const tree = this.buildSourceFromAwsSecrets(secrets);
    this.setSource(() => tree);
  }

  /**
   * Returns the current secrets map. Used when building Handlebars context.
   * Transforms SecretVariableTree into a simple nested object with just values.
   */
  getSecrets(): Record<string, unknown> {
    return transformTreeToValues(this.source());
  }

  /**
   * Returns true only if fullPath is "secrets.xxx.yyy" and the path xxx.yyy
   * exists and is a leaf value. Intermediate objects (e.g. secrets.cities) return false.
   */
  hasSecretsPath(fullPath: string): boolean {
    if (!fullPath.startsWith(SECRETS_PREFIX)) {
      return false;
    }

    const path = fullPath.slice(SECRETS_PREFIX.length);
    if (!path) {
      return false;
    }

    const value = getValueByPath(this.source(), path);
    return isResolvableLeaf(value);
  }

  /**
   * Lists all leaf secret paths for autocomplete/popover.
   * Each name is the full template path (e.g. "secrets.cities.chicago").
   */
  getSecretsList(): SecretVariable[] {
    const entries = flattenToLeafPaths(this.source());
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
  getSecretsVariable(name: string): SecretVariable | undefined {
    if (!this.hasSecretsPath(name)) {
      return undefined;
    }

    const path = name.slice(SECRETS_PREFIX.length);
    const entries = flattenToLeafPaths(this.source());

    const found = entries.find((e) => e.name === path);
    if (!found) {
      return undefined;
    }

    return {
      name: `${SECRETS_PREFIX}${found.name}`,
      value: found.value,
      id: `${SECRETS_PREFIX}${found.id}`,
      scope: VariableScope.SECRETS,
    };
  }
}

export const secretVariables = new SecretVariablesService();
