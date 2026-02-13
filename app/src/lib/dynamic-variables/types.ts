import { VariableScope } from "backend/environment/types";

export interface DynamicVariable {
  name: string;
  description: string;
  example: string;
  generate: (...args: unknown[]) => string | number | boolean | unknown;
  scope: VariableScope.DYNAMIC;
}

export type VariableContext = Record<string, unknown>;
