import { VariableScope } from "@requestly/shared/types/entities/apiClient";

export interface SecretVariable {
  name: string;
  value: string;
  id: string;
  scope: VariableScope.SECRETS;
}

/**
 * Type that represents either a SecretVariable or a nested object
 * containing SecretVariables (supports up to 2 levels of nesting).
 */
export interface SecretVariableTree {
  [key: string]: SecretVariable | { [key: string]: SecretVariable };
}
