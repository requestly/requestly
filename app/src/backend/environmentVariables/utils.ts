import lodash from "lodash";
import { EnvironmentVariableValue } from "./types";
import Logger from "lib/logger";

export const renderTemplate = (template: string, variables: Record<string, EnvironmentVariableValue>) => {
  lodash.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

  const parsedVariable = Object.entries(variables).reduce((acc, [key, value]) => {
    acc[key] = value.localValue ?? value.syncValue;
    return acc;
  }, {} as Record<string, string | number | boolean>);
  try {
    return lodash.template(template)(parsedVariable);
  } catch (e) {
    Logger.error("Error while rendering template");
    return template;
  }
};
