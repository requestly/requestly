import { AwsSecretValue } from "@requestly/shared/types/entities/secretsManager";
import { VariableScope } from "../../backend/environment/types";
import { parseSecretKeyValues } from "../../features/settings/secrets-manager/utils/parseSecretKeyValues";
import { SecretVariable } from "./types";

const SECRETS_PREFIX = "secrets:";

export type SecretsSource = () => SecretVariable[];

export class SecretVariablesService {
  private source: SecretsSource = () => [];

  setSource(source: SecretsSource): void {
    this.source = source;
  }

  private buildSourceFromAwsSecrets(secrets: AwsSecretValue[]): SecretVariable[] {
    return secrets.flatMap((secret) => {
      const alias = secret.secretReference.alias;
      const id = secret.secretReference.id;
      const keyValues = parseSecretKeyValues(secret.value);

      if (keyValues && keyValues.length > 0) {
        return keyValues.map((kv) => ({
          name: `${alias}.${kv.key}`,
          value: kv.value,
          id: `${id}.${kv.key}`,
          scope: VariableScope.SECRETS,
        }));
      }

      return [{ name: alias, value: secret.value, id, scope: VariableScope.SECRETS }];
    });
  }

  updateSourceFromSecrets(secrets: AwsSecretValue[]): void {
    const tree = this.buildSourceFromAwsSecrets(secrets);
    this.setSource(() => tree);
  }

  /**
   * Returns a flat map of all secrets keyed by their full template path
   * (e.g. { "secrets:apple": "red", "secrets:cities.chicago": "Chicago" }).
   * Used when building the Handlebars resolution context.
   */
  getFlatSecrets(): Record<string, string> {
    return Object.fromEntries(this.getSecretsList().map((v) => [v.name, v.value]));
  }

  /**
   * Returns true if fullPath is "secrets:xxx" (or "secrets:xxx.yyy") and
   * matches a known secret. E.g. "secrets:apple" -> true, "secrets:cities" -> false.
   */
  hasSecretsPath(fullPath: string): boolean {
    if (!fullPath.startsWith(SECRETS_PREFIX)) {
      return false;
    }

    const path = fullPath.slice(SECRETS_PREFIX.length);
    if (!path) {
      return false;
    }

    return this.source().some((v) => v.name === path);
  }

  /**
   * Lists all leaf secret paths for autocomplete/popover.
   * Each name is the full template path (e.g. "secrets:cities.chicago").
   */
  getSecretsList(): SecretVariable[] {
    return this.source().map((v) => ({
      name: `${SECRETS_PREFIX}${v.name}`,
      value: v.value,
      id: `${SECRETS_PREFIX}${v.id}`,
      scope: VariableScope.SECRETS,
    }));
  }

  /**
   * Returns the secrets list entry for a given full path, or undefined.
   *  @example
   * getSecretsVariable("secrets:cities.newYork") // → { name: "cities.newYork", value: "New York", ... }
   * getSecretsVariable("cities.newYork")          // → undefined (missing "secrets:" prefix)
   * getSecretsVariable("secrets:nonExistent")     // → undefined (not found in source)
   */
  getSecretsVariable(name: string): SecretVariable | undefined {
    if (!name.startsWith(SECRETS_PREFIX)) {
      return undefined;
    }

    const path = name.slice(SECRETS_PREFIX.length);
    if (!path) {
      return undefined;
    }

    const found = this.source().find((v) => v.name === path);
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
