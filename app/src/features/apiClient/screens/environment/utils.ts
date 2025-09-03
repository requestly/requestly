import { EnvironmentVariables } from "backend/environment/types";
import { VariableRow } from "./components/VariablesList/VariablesList";

export const isGlobalEnvironment = (environmentId: string) => {
  // FIXME: isGlobalEnvironment should be a method, which operates on an object or a flag.
  if (!environmentId) {
    return false;
  }
  return environmentId === "global" || environmentId.endsWith("/environments/global.json");
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
