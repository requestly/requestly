import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";
import { VariableEntity } from "./local/services/types";

export const parseEntityVariables = (variables: VariableEntity) => {
  const result: EnvironmentVariables = {};

  Object.keys(variables).forEach((key) => {
    result[key] = {
      id: variables[key].id,
      type: variables[key].isSecret ? EnvironmentVariableType.Secret : variables[key].type,
      localValue: variables[key].value,
    };
  });

  return result;
};

export function parseFsId(id: string) {
	return id;
  // return encodeURIComponent(id);
}

export function parseNativeId(id: string) {
	return id;
  // return decodeURIComponent(id);
}
