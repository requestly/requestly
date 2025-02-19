import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";

export const parseEntityVariables = (variables: Record<string, any>) => {
  const result: EnvironmentVariables = {};

  Object.keys(variables).forEach((key, index) => {
    result[key] = {
      id: index,
      type: EnvironmentVariableType.String,
      localValue: variables[key],
    };
  });

  return result;
};

export function parseFsId(id: string) {
  return encodeURIComponent(id);
}

export function parseNativeId(id: string) {
  return decodeURIComponent(id);
}
