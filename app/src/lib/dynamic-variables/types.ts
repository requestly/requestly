import { VariableScope } from "../../backend/environment/types";

export interface DynamicVariable {
  name: string;
  description: string;
  example: string;
  generate: (...args: unknown[]) => string | number | boolean;
  /**
   * Identifies this as a dynamic variable in the variable resolution system.
   * Used to distinguish auto-generated variables from user-defined scoped variables and
   * ensures dynamic variables have the lowest priority in the resolution chain.
   */
  scope: VariableScope.DYNAMIC;
}

export type VariableContext = Record<string, unknown>;
