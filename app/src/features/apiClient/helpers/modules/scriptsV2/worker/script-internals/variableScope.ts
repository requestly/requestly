import { LocalScope } from "modules/localScope";

function sanitizeValue(value: any): string | number | boolean | null | undefined {
  const type = typeof value;

  // Return primitives as-is
  if (type === "string" || type === "number" || type === "boolean" || value === null || value === undefined) {
    return value;
  }

  // Handle complex objects by converting to string representation
  let stringValue: string;
  try {
    stringValue = String(value);
  } catch {
    return "[object Object]";
  }

  // If the string representation is a valid number, return it as a number
  const parsedNumber = Number(stringValue);
  if (!isNaN(parsedNumber) && isFinite(parsedNumber) && stringValue.trim() !== "") {
    return parsedNumber;
  }

  // If the string representation is a valid boolean, return it as a boolean
  const lowercased = stringValue.toLowerCase().trim();
  if (lowercased === "true") {
    return true;
  }
  if (lowercased === "false") {
    return false;
  }

  // If the string representation is 'null', return null
  if (lowercased === "null") {
    return null;
  }

  // Return the string representation
  return stringValue;
}

export class VariableScope {
  constructor(
    private localScope: LocalScope,
    private variableScopeName: "environment" | "global" | "collectionVariables" | "variables"
  ) {}

  set(key: string, value: any, options?: any) {
    if (key === undefined || value === undefined) {
      throw new Error(`Key or value is undefined while setting ${this.variableScopeName} variable.`);
    }
    value = sanitizeValue(value);
    const currentVariables = this.localScope.get(this.variableScopeName);
    if (this.variableScopeName === "variables") {
      this.localScope.set(this.variableScopeName, {
        ...currentVariables,
        [key]:
          key in currentVariables
            ? {
                ...currentVariables[key],
                localValue: value,
                isPersisted:
                  options?.persist !== undefined ? !!options.persist : currentVariables[key].isPersisted ?? false,
              }
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
