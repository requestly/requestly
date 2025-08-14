import { LocalScope } from "modules/localScope";
// here
export class VariableScope {
  constructor(
    private localScope: LocalScope,
    private variableScopeName: "environment" | "global" | "collectionVariables" | "runtime"
  ) {}

  set(key: string, value: any, options?: any) {
    if (key === undefined || value === undefined) {
      throw new Error(`Key or value is undefined while setting ${this.variableScopeName} variable.`);
    }
    if (this.variableScopeName === "runtime") {
      const LOCAL_SCOPE_NAME = "variables"; // because the scope name is different from the attribute exposed in the script
      const currentVariables = this.localScope.get(LOCAL_SCOPE_NAME);
      this.localScope.set(LOCAL_SCOPE_NAME, {
        ...currentVariables,
        [key]:
          key in currentVariables
            ? { ...currentVariables[key], syncValue: value, isPersisted: !!options?.persist }
            : { syncValue: value, type: typeof value, isPersisted: !!options?.persist },
      });
    } else {
      const currentVariables = this.localScope.get(this.variableScopeName);
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
