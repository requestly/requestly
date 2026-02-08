import { compile } from "handlebars";
import { EnvironmentVariables } from "./types";
import Logger from "lib/logger";
import { isEmpty } from "lodash";
import { getScopedVariables, Scope } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { EnvironmentVariableData, VariableData } from "features/apiClient/store/variables/types";
import { ApiClientFeatureContext } from "features/apiClient/slices";
import { reduxStore } from "store";
import { DepGraph } from "dependency-graph";

type Variables = Record<string, string | number | boolean>;
interface RenderResult<T> {
  renderedTemplate: T;
  usedVariables: Record<string, unknown>;
}

export function renderVariables<T extends string | Record<string, any>>(
  template: T,
  recordId: string,
  ctx: ApiClientFeatureContext,
  scopes?: Scope[]
): {
  renderedVariables?: Record<string, unknown>;
  result: T;
} {
  const state = ctx.store.getState();
  const runtimeVariables = reduxStore.getState().runtimeVariables.entity.variables;
  const scopedVariables = getScopedVariables(state, runtimeVariables, recordId, { scopes });
  const variables = Object.fromEntries(
    Object.entries(scopedVariables).map(([key, [variable, _]]) => {
      return [key, variable];
    })
  );

  const { renderedTemplate, renderedVariables } = renderTemplate(template, variables);
  return { renderedVariables, result: renderedTemplate };
}

export const renderTemplate = <T extends string | Record<string, T>>(
  template: T,
  variables: Record<string, VariableData> = {}
): {
  renderedVariables?: Record<string, unknown>;
  renderedTemplate: T;
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
      envVars[key] = isEmpty(value.localValue)
        ? (value.syncValue as string | number | boolean)
        : (value.localValue as string | number | boolean);
    }

    return envVars;
  }, {} as Variables);

  // Resolve composite variables (variables that reference other variables)
  const resolvedVariables = resolveCompositeVariables(parsedVariables);

  const { renderedTemplate, usedVariables } = recursiveRender(template, resolvedVariables);
  return {
    renderedTemplate,
    renderedVariables: usedVariables,
  };
};

const recursiveRender = <T>(input: T, variables: Variables): RenderResult<T> => {
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

const processObject = <T extends Record<string, any>>(input: T, variables: Variables): RenderResult<T> => {
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
    renderedTemplate: result.rendered as T, // need assertion since rendered is also being treated as array
    usedVariables: result.variables,
  };
};

const processTemplateString = <T extends string>(input: T, variables: Variables): RenderResult<T> => {
  try {
    const { wrappedTemplate, usedVariables } = collectAndEscapeVariablesFromTemplate(input, variables);
    const hbsTemplate = compile(wrappedTemplate, { noEscape: true });
    const renderedTemplate = hbsTemplate(variables) as T; // since handlebars generic types resolve to any; not string

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

    if (matchStartsWithKnownHelper) {
      usedVariables[varName] = variables[varName];
    }

    if (isMatchEmpty || !matchStartsWithKnownHelper) {
      return escapeMatchFromHandlebars(completeMatch);
    }

    // If variable name contains dots, wrap it in square brackets for Handlebars
    // otherwise a.b gets parsed as nested object path
    // https://handlebarsjs.com/guide/expressions.html#literal-segments
    if (varName.includes(".")) {
      return `{{[${varName}]}}`;
    }

    return completeMatch;
  });

  return { wrappedTemplate, usedVariables };
};

/**
 * Resolves composite variables (variables that reference other variables) using dependency-graph
 * Example: composite = "composite_value", var_1 = "{{composite}}-name" => var_1 = "composite_value-name"
 * @param variables - The variables to resolve
 * @returns Resolved variables with all composite references expanded
 */
const resolveCompositeVariables = (variables: Variables): Variables => {
  const resolved: Variables = { ...variables };
  const graph = new DepGraph({
    circular: true, // to not throw errors in case of circular dependencies and return the unresolved variables as is
  });

  Object.keys(variables).forEach((key) => {
    graph.addNode(key);
  });

  // Add dependencies
  Object.entries(variables).forEach(([key, value]) => {
    if (typeof value === "string") {
      const variableReferences = extractVariableNameFromStringIfExists(value);
      if (variableReferences) {
        variableReferences.forEach((refName) => {
          const trimmedRef = refName.trim();
          // Only add dependency if the referenced variable exists and is not a self-reference
          if (trimmedRef in variables && trimmedRef !== key) {
            graph.addDependency(key, trimmedRef);
          }
        });
      }
    }
  });

  // Get resolution order (topologically sorted)
  const resolutionOrder = graph.overallOrder();

  // Resolve variables in dependency order
  for (const varName of resolutionOrder) {
    const value = resolved[varName];

    // Only process string values that might contain variable references
    if (typeof value !== "string") {
      continue;
    }

    // Check if this value contains any variable references
    const variableReferences = extractVariableNameFromStringIfExists(value);
    if (!variableReferences || variableReferences.length === 0) {
      continue;
    }

    // Render this variable value using the current resolved variables
    try {
      // Create a resolution context without the current variable
      // This prevents self-reference resolution (e.g., a = "{{a}}-{{b}}")
      const resolutionContext = { ...resolved };
      delete resolutionContext[varName];

      const { wrappedTemplate } = collectAndEscapeVariablesFromTemplate(value, resolutionContext);
      const hbsTemplate = compile(wrappedTemplate, { noEscape: true });
      const renderedValue = hbsTemplate(resolutionContext);
      resolved[varName] = renderedValue;
    } catch (e) {
      // Keep the original value if rendering fails
      Logger.error("Error resolving composite variable:", varName, e);
    }
  }

  return resolved;
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
        isPersisted: true,
      } as EnvironmentVariableData;

      /*
      Commented the code belowe as this merge logic removes the localValue if it doesn't exist which leads to tabs showing unsaved changes because of the localValue missing from variable object
       */

      // // Remove localValue if it doesn't exist
      // if (!updatedValue.localValue) {
      //   delete updatedValue.localValue;
      // }

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
