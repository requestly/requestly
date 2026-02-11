import { DynamicVariableNotFoundError } from "../errors";
import type { DynamicVariable } from "../types";

export abstract class DynamicVariableProvider {
  abstract readonly name: string;
  abstract readonly variables: Map<string, DynamicVariable>;

  generate(name: string, ...args: unknown[]): string | number | boolean {
    const variable = this.variables.get(name);

    if (!variable) {
      throw new DynamicVariableNotFoundError(name);
    }

    return variable.generate(...args);
  }

  getVariable(name: string): DynamicVariable | undefined {
    return this.variables.get(name);
  }

  has(name: string): boolean {
    return this.variables.has(name);
  }

  list(): DynamicVariable[] {
    return Array.from(this.variables.values());
  }
}
