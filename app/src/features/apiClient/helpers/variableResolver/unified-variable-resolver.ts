import { dynamicVariableResolver } from "lib/dynamic-variables";
import { DynamicVariable } from "lib/dynamic-variables/types";
import { VariableScope } from "backend/environment/types";
import { ScopedVariable, ScopedVariables } from "./variable-resolver";

export type UnifiedVariable = ScopedVariable | DynamicVariable;
export type UnifiedVariables = Record<string, UnifiedVariable>;

export function getVariable(key: string, scopedVariables?: ScopedVariables): UnifiedVariable | undefined {
  return scopedVariables?.[key] || dynamicVariableResolver.getVariable(key);
}

export function hasVariable(key: string, scopedVariables?: ScopedVariables): boolean {
  return !!scopedVariables?.[key] || dynamicVariableResolver.has(key);
}

export function isDynamicVariable(variable: UnifiedVariable): variable is DynamicVariable {
  return (variable as DynamicVariable).scope === VariableScope.DYNAMIC;
}

export function getAllVariables(scopedVariables?: ScopedVariables): UnifiedVariables {
  const unified: UnifiedVariables = {};

  // Add scoped variables first so they appear before dynamic variables
  if (scopedVariables) Object.assign(unified, scopedVariables);
  // Add dynamic variables that don't conflict with scoped ones
  dynamicVariableResolver.listAll().forEach((v) => {
    if (!unified[v.name]) {
      unified[v.name] = v;
    }
  });

  return unified;
}

export function getVariableDisplayValue(variable: UnifiedVariable): string {
  if (isDynamicVariable(variable)) return variable.example;
  const [varData] = variable;
  return String(varData.localValue ?? varData.syncValue ?? "");
}
