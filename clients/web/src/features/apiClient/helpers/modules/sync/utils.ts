import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";
import { VariableEntity } from "./local/services/types";

export const parseEntityVariables = (variables: VariableEntity) => {
  const result: EnvironmentVariables = {};

  Object.keys(variables).forEach((key) => {
    result[key] = {
      id: variables[key].id,
      type: variables[key].isSecret ? EnvironmentVariableType.Secret : variables[key].type,
      syncValue: variables[key].value,
      isPersisted: true,
    };
  });

  return result;
};

export function parseFsId(id: string) {
  return id;
}

export function parseNativeId(id: string) {
  return id;
}

export function getNormalizedPath(path: string) {
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;
  return normalizedPath;
}

export function appendPath(basePath: string, resourcePath: string) {
  const separator = basePath.endsWith("/") ? "" : "/";
  return `${basePath}${separator}${resourcePath}`;
}
