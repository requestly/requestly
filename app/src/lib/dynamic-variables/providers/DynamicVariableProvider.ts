import { DynamicVariableNotFoundError } from "../errors";
import type { DynamicVariable } from "../types";

export abstract class DynamicVariableProvider {
  abstract readonly name: string;
  abstract readonly variableNames: Map<string, DynamicVariable>;

  generate(name: string, ...args: unknown[]): ReturnType<DynamicVariable["generate"]> {
    const variable = this.variableNames.get(name);

    if (!variable) {
      throw new DynamicVariableNotFoundError(name);
    }

    return variable.generate(...args);
  }

  getVariable(name: string): DynamicVariable | undefined {
    return this.variableNames.get(name);
  }

  has(name: string): boolean {
    return this.variableNames.has(name);
  }

  list(): DynamicVariable[] {
    return Array.from(this.variableNames.values());
  }
}
