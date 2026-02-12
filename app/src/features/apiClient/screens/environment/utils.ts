import { EnvironmentVariables } from "backend/environment/types";
import { VariableRow } from "./components/VariablesList/VariablesList";
import { GLOBAL_ENVIRONMENT_ID } from "features/apiClient/slices/common/constants";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

export const isGlobalEnvironment = (environmentId: string) => {
  if (!environmentId) {
    return false;
  }
  // Standardized to use constant
  return environmentId === GLOBAL_ENVIRONMENT_ID || environmentId.endsWith("/environments/global.json");
};

export const mapToEnvironmentArray = (variables: EnvironmentVariables, order?: string[]): VariableRow[] => {
  // If order is provided, use it
  if (order && order.length > 0) {
    const orderedKeys = new Set(order);

    // Build ordered list first
    const orderedVariables = order
      .filter((key) => key in variables) // Use "in" to detect existing keys even if falsy
      .map(
        (key) =>
          ({
            key,
            ...variables[key],
          } as VariableRow)
      );

    // Append any remaining keys not in order
    const remainingVariables = Object.keys(variables)
      .filter((key) => !orderedKeys.has(key))
      .map(
        (key) =>
          ({
            key,
            ...variables[key],
          } as VariableRow)
      );

    return [...orderedVariables, ...remainingVariables];
  }

  // Fallback to Object.keys order (backward compatibility)
  return Object.keys(variables).map(
    (key) =>
      ({
        key,
        ...variables[key],
      } as VariableRow)
  );
};

export const convertEnvironmentToMap = (variables: VariableRow[]) => {
  return variables.reduce((acc, variable) => {
    if (variable.key) {
      const { key, ...newVariable } = variable;
      acc[variable.key] = { ...newVariable, isPersisted: true };
    }
    return acc;
  }, {} as EnvironmentVariables);
};

export const parseVariables = (variables: ScopedVariables) => {
  if (!variables) return [];
  const flattened = Object.entries(variables).map(([label, arr]) => ({
    label,
    ...Object.assign({}, ...arr),
  }));
  return flattened;
};
