export interface DynamicVariable {
  name: string;
  description: string;
  example: string;
  generate: (...args: unknown[]) => string | number | boolean;
}

export type VariableContext = Record<string, unknown>;
