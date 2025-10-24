import { LocalScope } from "modules/localScope";
export class VariableScope {
  constructor(
    private localScope: LocalScope,
    private variableScopeName: "environment" | "global" | "collectionVariables" | "variables"
  ) {}

  set(key: string, value: any, options?: any) {
    if (key === undefined || value === undefined) {
      throw new Error(`Key or value is undefined while setting ${this.variableScopeName} variable.`);
    }
    const currentVariables = this.localScope.get(this.variableScopeName);
    if (this.variableScopeName === "variables") {
      this.localScope.set(this.variableScopeName, {
        ...currentVariables,
        [key]:
          key in currentVariables
            ? { ...currentVariables[key], localValue: value, isPersisted: !!options?.persist }
            : { localValue: value, type: typeof value, isPersisted: !!options?.persist },
      });
    } else {
      this.localScope.set(this.variableScopeName, {
        ...currentVariables,
        [key]:
          key in currentVariables
            ? { ...currentVariables[key], localValue: value }
            : { localValue: value, syncValue: value, type: typeof value },
      });
    }
  }

  get(key: string) {
    const variables = this.localScope.get(this.variableScopeName);
    return variables[key]?.localValue || variables[key]?.syncValue;
  }

  unset(key: string) {
    const variables = this.localScope.get(this.variableScopeName);
    delete variables[key];
    this.localScope.set(this.variableScopeName, variables);
  }
}
