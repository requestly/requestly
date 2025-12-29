import { EnvironmentVariables } from "backend/environment/types";
import { VariableRow } from "./components/VariablesList/VariablesList";
import { GLOBAL_ENVIRONMENT_ID } from "features/apiClient/slices/common/constants";

export const isGlobalEnvironment = (environmentId: string) => {
  if (!environmentId) {
    return false;
  }
  // Standardized to use constant
  return environmentId === GLOBAL_ENVIRONMENT_ID || environmentId.endsWith("/environments/global.json");
};

export const mapToEnvironmentArray = (variables: EnvironmentVariables): VariableRow[] => {
  return Object.keys(variables).map((key) => ({
    key,
    ...variables[key],
  }));
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
