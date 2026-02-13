export interface DynamicVariable {
  name: string;
  description: string;
  example: string;
  generate: (...args: unknown[]) => string | number | boolean | unknown;
}

export type VariableContext = Record<string, unknown>;
