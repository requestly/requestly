import { variableResolver } from "../../../../lib/dynamic-variables";
import { DynamicVariable } from "../../../../lib/dynamic-variables/types";
import { VariableScope } from "../../../../backend/environment/types";
import { ScopedVariable, ScopedVariables } from "./variable-resolver";

export type Variable = ScopedVariable | DynamicVariable;
export type Variables = Record<string, Variable>;

export function getVariable(key: string, scopedVariables?: ScopedVariables): Variable | undefined {
  return scopedVariables?.[key] || variableResolver.getVariable(key);
}

export function hasVariable(key: string, scopedVariables?: ScopedVariables): boolean {
  return !!scopedVariables?.[key] || variableResolver.has(key);
}

export function checkIsDynamicVariable(variable: Variable): variable is DynamicVariable {
  return (variable as DynamicVariable).scope === VariableScope.DYNAMIC;
}

export function mergeAndParseAllVariables(scopedVariables?: ScopedVariables): Variables {
  const unified: Variables = {};

  // Add scoped variables first so they appear before dynamic variables
  if (scopedVariables) Object.assign(unified, scopedVariables);
  // Add dynamic variables that don't conflict with scoped ones
  variableResolver.listAll().forEach((v) => {
    if (!unified[v.name]) {
      unified[v.name] = v;
    }
  });
  return unified;
}
