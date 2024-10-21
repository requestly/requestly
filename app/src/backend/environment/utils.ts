import { compile } from "handlebars";
import { EnvironmentVariableValue } from "./types";
import Logger from "lib/logger";
import { isEmpty } from "lodash";

type Variables = Record<string, string | number | boolean>;

export const renderTemplate = (
  template: string | Record<string, any>,
  variables: Record<string, EnvironmentVariableValue> = {}
): any => {
  const parsedVariables = Object.entries(variables).reduce((envVars, [key, value]) => {
    envVars[key] = isEmpty(value.localValue) ? value.syncValue : value.localValue;
    return envVars;
  }, {} as Variables);

  return recursiveRender(template, parsedVariables);
};

const recursiveRender = (input: string | Record<string, any>, variables: Variables): any => {
  if (typeof input === "string") {
    try {
      const wrappedTemplate = wrapUnexpectedTemplateCaptures(input, variables);
      const hbsTemplate = compile(wrappedTemplate);
      return hbsTemplate(variables);
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
      Array.isArray(input) ? [] : {} // Maintain object/array structure
    );
  }
  return input;
};

// it will add `\\` to its prefix, signaling handlebars should ignore it
const escapeMatchFromHandlebars = (match: string) => {
  return match.replace(/({{)/g, "\\$1");
};

const wrapUnexpectedTemplateCaptures = (template: string, variables: Record<string, unknown>) => {
  const helperNames = Object.keys(variables);
  return template.replace(/{{\s*([\s\S]*?)\s*}}/g, (completeMatch, firstMatchedGroup) => {
    const isMatchEmpty = firstMatchedGroup.trim() === ""; // {{}}
    const matchStartsWithKnownHelper = helperNames.includes(firstMatchedGroup);

    if (isMatchEmpty || !matchStartsWithKnownHelper) {
      return escapeMatchFromHandlebars(completeMatch);
    }
    return completeMatch;
  });
};
