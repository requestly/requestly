import lodash from "lodash";
import { EnvironmentVariableValue } from "./types";

export const renderString = (template: string, variables: Record<string, EnvironmentVariableValue>) => {
  lodash.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

  Object.entries(variables).reduce((acc, [key, value]) => {
    acc[key] = value.localValue ?? value.syncValue;
    return acc;
  }, {} as Record<string, string | number | boolean>);

  return lodash.template(template)(variables);
};
