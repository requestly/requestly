import { compile } from "handlebars";
import { EnvironmentVariables, EnvironmentVariableValue } from "./types";
import Logger from "lib/logger";
import { isEmpty } from "lodash";

type Variables = Record<string, string | number | boolean>;
interface RenderResult {
  renderedTemplate: string | Record<string, any>;
  usedVariables: Record<string, unknown>;
}

export const renderTemplate = (
  template: string | Record<string, any>,
  variables: Record<string, EnvironmentVariableValue> = {}
): {
  renderedVariables?: Record<string, unknown>;
  renderedTemplate: string | Record<string, any>;
} => {
  if (!variables || Object.keys(variables).length === 0) {
    return {
      renderedTemplate: template,
      renderedVariables: {},
    };
  }

  const parsedVariables = Object.entries(variables).reduce((envVars, [key, value]) => {
    if (typeof value.localValue === "number") {
      envVars[key] = value.localValue ?? value.syncValue;
    } else {
      envVars[key] = isEmpty(value.localValue) ? value.syncValue : value.localValue;
    }

    return envVars;
  }, {} as Variables);

  const { renderedTemplate, usedVariables } = recursiveRender(template, parsedVariables);
  return {
    renderedTemplate,
    renderedVariables: usedVariables,
  };
};

const recursiveRender = (input: string | Record<string, any>, variables: Variables): RenderResult => {
  if (typeof input === "string") {
    return processTemplateString(input, variables);
  } else if (typeof input === "object" && input !== null) {
    return processObject(input, variables);
  }
  return {
    renderedTemplate: input,
    usedVariables: {},
  };
};

const processObject = (input: Record<string, any>, variables: Variables): RenderResult => {
  const result = Object.entries(input).reduce(
    (
      acc: {
        rendered: Record<string, any>;
        variables: Record<string, unknown>;
      },
      [key, value]
    ) => {
      const { renderedTemplate, usedVariables } = recursiveRender(value, variables);
      acc.rendered[key] = renderedTemplate;
      acc.variables = { ...acc.variables, ...usedVariables };
      return acc;
    },
    {
      rendered: Array.isArray(input) ? [] : {},
      variables: {},
    }
  );

  return {
    renderedTemplate: result.rendered,
    usedVariables: result.variables,
  };
};

const processTemplateString = (input: string, variables: Variables): RenderResult => {
  try {
    const { wrappedTemplate, usedVariables } = collectAndEscapeVariablesFromTemplate(input, variables);
    const hbsTemplate = compile(wrappedTemplate);
    const renderedTemplate = hbsTemplate(variables);

    return {
      renderedTemplate,
      usedVariables,
    };
  } catch (e) {
    Logger.error("Error while rendering template string:", input);
    return {
      renderedTemplate: input,
      usedVariables: {},
    };
  }
};

// it will add `\\` to its prefix, signaling handlebars should ignore it
const escapeMatchFromHandlebars = (match: string) => {
  return match.replace(/({{)/g, "\\$1");
};

const collectAndEscapeVariablesFromTemplate = (
  template: string,
  variables: Variables
): { wrappedTemplate: string; usedVariables: Record<string, unknown> } => {
  const usedVariables: Record<string, unknown> = {};

  const wrappedTemplate = template.replace(/{{\s*([\s\S]*?)\s*}}/g, (completeMatch, firstMatchedGroup) => {
    const varName = firstMatchedGroup.trim();
    const isMatchEmpty = varName === ""; // {{}}
    const matchStartsWithKnownHelper = varName in variables;
    usedVariables[varName] = variables[varName];

    if (isMatchEmpty || !matchStartsWithKnownHelper) {
      return escapeMatchFromHandlebars(completeMatch);
    }

    return completeMatch;
  });

  return { wrappedTemplate, usedVariables };
};

export const mergeLocalAndSyncVariables = (
  currentVariables: EnvironmentVariables,
  newVariables: EnvironmentVariables
) => {
  const updatedVariables: EnvironmentVariables = Object.fromEntries(
    Object.entries(newVariables).map(([key, value], index) => {
      const prevValue = currentVariables[key];
      const updatedValue = {
        id: value.id ?? prevValue?.id ?? index,
        localValue: value.localValue ?? prevValue?.localValue,
        syncValue: value.syncValue ?? prevValue?.syncValue,
        type: value.type,
      };

      // Remove localValue if it doesn't exist
      if (!updatedValue.localValue) {
        delete updatedValue.localValue;
      }

      return [key, updatedValue];
    })
  );

  return {
    ...updatedVariables,
  };
};

export const extractVariableNameFromStringIfExists = (string: string) => {
  const regex = /{{([^}]+)}}/g;
  const matches = Array.from(string.matchAll(regex));
  return matches.length > 0 ? matches.map((match) => match[1]) : null;
};
