import lodash from "lodash";
import { EnvironmentVariableValue } from "./types";
import Logger from "lib/logger";

type Variables = Record<string, string | number | boolean>;

export const renderTemplate = (
  template: string | Record<string, any>,
  variables: Record<string, EnvironmentVariableValue>
): any => {
  lodash.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

  const parsedVariables = Object.entries(variables).reduce((acc, [key, value]) => {
    acc[key] = value.localValue ?? value.syncValue;
    return acc;
  }, {} as Variables);

  return recursiveRender(template, parsedVariables);
};

const recursiveRender = (input: string | Record<string, any>, variables: Variables): any => {
  if (typeof input === "string") {
    try {
      return lodash.template(input)(variables);
    } catch (e) {
      Logger.error("Error while rendering template string:", input);
      return input; // Return the template unchanged if rendering fails
    }
  } else if (typeof input === "object" && input !== null) {
    return Object.entries(input).reduce(
      (acc: any, [key, value]) => {
        acc[key] = recursiveRender(value, variables); // Recursively render the value
        return acc;
      },
      Array.isArray(input) ? [] : {}
    ); // Maintain object/array structure
  }
  return input;
};
