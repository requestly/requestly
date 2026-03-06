import { AwsSecretValue } from "@requestly/shared/types/entities/secretsManager";
import { VariableScope } from "../../backend/environment/types";
import { SecretVariable } from "./types";

const SECRETS_PREFIX = "secrets:";

export type SecretsSource = () => SecretVariable[];

function defaultSource(): SecretVariable[] {
  return [
    { name: "apple", value: "red", id: "apple", scope: VariableScope.SECRETS },
    { name: "banana", value: "yellow", id: "banana", scope: VariableScope.SECRETS },
    { name: "cherry", value: "red", id: "cherry", scope: VariableScope.SECRETS },
    { name: "cities.newYork", value: "New York", id: "cities.newYork", scope: VariableScope.SECRETS },
    { name: "cities.losAngeles", value: "Los Angeles", id: "cities.losAngeles", scope: VariableScope.SECRETS },
    { name: "cities.chicago", value: "Chicago", id: "cities.chicago", scope: VariableScope.SECRETS },
  ];
}

export class SecretVariablesService {
  private source: SecretsSource = defaultSource;

  setSource(source: SecretsSource): void {
    this.source = source;
  }

  private buildSourceFromAwsSecrets(secrets: AwsSecretValue[]): SecretVariable[] {
    // would be fixed in subsequent PRs
    return secrets.map((secret) => ({
      name: secret.secretReference.alias,
      value: secret.value,
      id: secret.secretReference.id,
      scope: VariableScope.SECRETS,
    }));
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
