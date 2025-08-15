import { EnvironmentVariables } from "backend/environment/types";
import { EnvironmentVariableTableRow } from "./components/VariablesList/EnvironmentVariablesList";

export const isGlobalEnvironment = (environmentId: string) => {
  // FIXME: isGlobalEnvironment should be a method, which operates on an object or a flag.
  if (!environmentId) {
    return false;
  }
  return environmentId === "global" || environmentId.endsWith("/environments/global.json");
};

export const mapToEnvironmentArray = (variables: EnvironmentVariables) => {
  return Object.keys(variables).map((key) => ({
    key,
    ...variables[key],
  }));
};

export const convertEnvironmentToMap = (variables: EnvironmentVariableTableRow[]) => {
  return variables.reduce((acc, variable) => {
    if (variable.key) {
      const { key, ...newVariable } = variable;
      acc[variable.key] = newVariable;
    }
    return acc;
  }, {} as EnvironmentVariables);
};
