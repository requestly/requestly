import { variableResolver } from "../../../../lib/dynamic-variables";
import { DynamicVariable } from "../../../../lib/dynamic-variables/types";
import { VariableScope } from "../../../../backend/environment/types";
import { getSecretsVariable, getSecretsList, hasSecretsPath } from "../../../../lib/secret-variables";
import { ScopedVariable, ScopedVariables } from "./variable-resolver";
import { SecretVariable } from "lib/secret-variables/types";

export type Variable = ScopedVariable | DynamicVariable | SecretVariable;
export type Variables = Record<string, Variable>;

export function getVariable(key: string, scopedVariables?: ScopedVariables): Variable | undefined {
  return scopedVariables?.[key] || variableResolver.getVariable(key) || getSecretsVariable(key);
}

export function hasVariable(key: string, scopedVariables?: ScopedVariables): boolean {
  return !!scopedVariables?.[key] || variableResolver.has(key) || hasSecretsPath(key);
}

export function checkIsDynamicVariable(variable: Variable): variable is DynamicVariable {
  return (variable as DynamicVariable).scope === VariableScope.DYNAMIC;
}

export function checkIsSecretsVariable(variable: Variable): variable is SecretVariable {
  return (variable as SecretVariable).scope === VariableScope.SECRETS;
}

export function mergeAndParseAllVariables(scopedVariables?: ScopedVariables): Variables {
  const unified: Variables = {};

  // Add scoped variables first so they appear before dynamic and secrets
  if (scopedVariables) Object.assign(unified, scopedVariables);
  // Add dynamic variables that don't conflict with scoped ones
  variableResolver.listAll().forEach((v) => {
    if (!unified[v.name]) {
      unified[v.name] = v;
    }
  });
  // Add secrets variables that don't conflict
  getSecretsList().forEach((v) => {
    if (!unified[v.name]) {
      unified[v.name] = v;
    }
  });
  return unified;
}
