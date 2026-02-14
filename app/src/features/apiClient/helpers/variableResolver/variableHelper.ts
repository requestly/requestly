import { dynamicVariableResolver } from "lib/dynamic-variables";
import { DynamicVariable } from "lib/dynamic-variables/types";
import { VariableScope } from "backend/environment/types";
import { ScopedVariable, ScopedVariables } from "./variable-resolver";

export type CompositeVariable = ScopedVariable | DynamicVariable;
export type CompositeVariables = Record<string, CompositeVariable>;

export function getVariable(key: string, scopedVariables?: ScopedVariables): CompositeVariable | undefined {
  return scopedVariables?.[key] || dynamicVariableResolver.getVariable(key);
}

export function hasVariable(key: string, scopedVariables?: ScopedVariables): boolean {
  return !!scopedVariables?.[key] || dynamicVariableResolver.has(key);
}

export function checkIsDynamicVariable(variable: CompositeVariable): variable is DynamicVariable {
  return (variable as DynamicVariable).scope === VariableScope.DYNAMIC;
}

export function getAllVariables(scopedVariables?: ScopedVariables, includeDynamicVariables = true): CompositeVariables {
  const unified: CompositeVariables = {};

  // Add scoped variables first so they appear before dynamic variables
  if (scopedVariables) Object.assign(unified, scopedVariables);
  // Add dynamic variables that don't conflict with scoped ones
  if (includeDynamicVariables) {
    dynamicVariableResolver.listAll().forEach((v) => {
      if (!unified[v.name]) {
        unified[v.name] = v;
      }
    });
  }
  return unified;
}
