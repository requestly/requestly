import type { DynamicVariable, VariableContext } from "../types";
import type { DynamicVariableProvider } from "../providers/DynamicVariableProvider";

export abstract class DynamicVariableResolver {
  constructor(protected provider: DynamicVariableProvider) {}

  getVariable(name: string): DynamicVariable | undefined {
    return this.provider.getVariable(name);
  }

  has(name: string): boolean {
    return this.provider.has(name);
  }

  listAll(): DynamicVariable[] {
    return this.provider.list();
  }

  abstract resolve(template: string, context?: VariableContext): string;
}
