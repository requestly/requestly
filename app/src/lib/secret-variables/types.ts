import { VariableScope } from "@requestly/shared/types/entities/apiClient";

export interface SecretVariable {
  name: string;
  value: string;
  id: string;
  scope: VariableScope.SECRETS;
}

/**
 * Recursive type that represents either a SecretVariable or a nested object
 * containing more SecretVariables (supports arbitrary nesting levels).
 */
export interface SecretVariableTree {
  [key: string]: SecretVariable | SecretVariableTree;
}
