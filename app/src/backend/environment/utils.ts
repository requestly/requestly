import { compile } from "handlebars";
import { EnvironmentVariables } from "./types";
import Logger from "lib/logger";
import { isEmpty } from "lodash";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { getScopedVariables, Scope } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { getApiClientRecordsStore } from "features/apiClient/commands/store.utils";
import { EnvironmentVariableData, VariableData } from "features/apiClient/store/variables/types";
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
  console.log("!!!debug", "template", { template, scopes });
  const parents = getApiClientRecordsStore(ctx).getState().getParentChain(recordId);
  const variables = Object.fromEntries(
    Array.from(getScopedVariables(parents, ctx.stores, scopes)).map(([key, [variable, _]]) => {
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
  console.log("!!!debug", "processtemplatestring", {
    input,
    variables,
  });
  try {
    const { wrappedTemplate, usedVariables } = collectAndEscapeVariablesFromTemplate(input, variables);
    const hbsTemplate = compile(wrappedTemplate, { noEscape: true });
    const renderedTemplate = hbsTemplate(variables) as T; // since handlebars generic types resolve to any; not string

    return {
      renderedTemplate,
      usedVariables,
    };
  } catch (e) {
    console.error("Error while rendering template string:", input);
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
 * OLD IMPLEMENTATION - Using max iterations approach
 * Kept for reference
 */
// const resolveCompositeVariables = (variables: Variables): Variables => {
//   const resolved: Variables = { ...variables };
//   const maxIterations = 10; // Prevent infinite loops in case of circular dependencies
//   let iteration = 0;
//   let hasUnresolvedVariables = true;

//   while (hasUnresolvedVariables && iteration < maxIterations) {
//     hasUnresolvedVariables = false;
//     iteration++;

//     for (const [key, value] of Object.entries(resolved)) {
//       // Only process string values that might contain variable references
//       if (typeof value !== "string") {
//         continue;
//       }

//       // Check if this value contains any variable references
//       const variableReferences = extractVariableNameFromStringIfExists(value);
//       if (!variableReferences || variableReferences.length === 0) {
//         continue;
//       }

//       // Check if all referenced variables are available and resolved
//       const allReferencesResolved = variableReferences.every((refName) => {
//         const refValue = resolved[refName.trim()];
//         // A reference is resolved if it exists and doesn't contain more variable references
//         return refValue !== undefined && (typeof refValue !== "string" || !refValue.includes("{{"));
//       });

//       if (allReferencesResolved) {
//         // Render this variable value using the current resolved variables
//         try {
//           const { wrappedTemplate } = collectAndEscapeVariablesFromTemplate(value, resolved);
//           const hbsTemplate = compile(wrappedTemplate, { noEscape: true });
//           const renderedValue = hbsTemplate(resolved);
//           resolved[key] = renderedValue;
//         } catch (e) {
//           Logger.error("Error resolving composite variable:", key, e);
//           // Keep the original value if rendering fails
//         }
//       } else {
//         // Mark that we still have unresolved variables
//         hasUnresolvedVariables = true;
//       }
//     }
//   }

//   if (iteration >= maxIterations) {
//     console.warn("!!!Composite variable resolution reached max iterations. Possible circular dependency.");
//   }

//   return resolved;
// };

/**
 * OLD IMPLEMENTATION - Custom topological sort
 * Kept for reference
 */
// const buildDependencyGraph = (variables: Variables): Map<string, string[]> => {
//   const graph = new Map<string, string[]>();

//   for (const [key, value] of Object.entries(variables)) {
//     const dependencies: string[] = [];

//     if (typeof value === "string") {
//       const variableReferences = extractVariableNameFromStringIfExists(value);
//       if (variableReferences) {
//         dependencies.push(...variableReferences.map((ref) => ref.trim()));
//       }
//     }

//     graph.set(key, dependencies);
//   }

//   return graph;
// };

// const topologicalSort = (graph: Map<string, string[]>): { sorted: string[]; cycles: string[][] } | null => {
//   const inDegree = new Map<string, number>();
//   const adjList = new Map<string, string[]>();

//   for (const [node, deps] of graph.entries()) {
//     if (!inDegree.has(node)) {
//       inDegree.set(node, 0);
//     }
//     for (const dep of deps) {
//       if (!inDegree.has(dep)) {
//         inDegree.set(dep, 0);
//       }
//     }
//   }

//   for (const [node, deps] of graph.entries()) {
//     for (const dep of deps) {
//       if (!adjList.has(dep)) {
//         adjList.set(dep, []);
//       }
//       adjList.get(dep)!.push(node);
//       inDegree.set(node, (inDegree.get(node) || 0) + 1);
//     }
//   }

//   const queue: string[] = [];
//   for (const [node, degree] of inDegree.entries()) {
//     if (degree === 0) {
//       queue.push(node);
//     }
//   }

//   const sorted: string[] = [];

//   while (queue.length > 0) {
//     const node = queue.shift()!;
//     sorted.push(node);

//     const neighbors = adjList.get(node) || [];
//     for (const neighbor of neighbors) {
//       const newDegree = (inDegree.get(neighbor) || 0) - 1;
//       inDegree.set(neighbor, newDegree);
//       if (newDegree === 0) {
//         queue.push(neighbor);
//       }
//     }
//   }

//   if (sorted.length !== inDegree.size) {
//     const cycles = findCycles(graph, new Set(sorted));
//     return { sorted, cycles };
//   }

//   return { sorted, cycles: [] };
// };

// const findCycles = (graph: Map<string, string[]>, processedNodes: Set<string>): string[][] => {
//   const cycles: string[][] = [];
//   const visited = new Set<string>();
//   const recursionStack = new Set<string>();

//   const dfs = (node: string, path: string[]): boolean => {
//     visited.add(node);
//     recursionStack.add(node);
//     path.push(node);

//     const dependencies = graph.get(node) || [];
//     for (const dep of dependencies) {
//       if (processedNodes.has(dep)) continue;

//       if (!visited.has(dep)) {
//         if (dfs(dep, [...path])) {
//           return true;
//         }
//       } else if (recursionStack.has(dep)) {
//         const cycleStartIndex = path.indexOf(dep);
//         const cycle = [...path.slice(cycleStartIndex), dep];
//         cycles.push(cycle);
//         return true;
//       }
//     }

//     recursionStack.delete(node);
//     return false;
//   };

//   for (const [node] of graph.entries()) {
//     if (!visited.has(node) && !processedNodes.has(node)) {
//       dfs(node, []);
//     }
//   }

//   return cycles;
// };

/**
 * Resolves composite variables (variables that reference other variables) using dependency-graph
 * Example: composite = "c_value", var_1 = "{{composite}}-name" => var_1 = "c_value-name"
 *
 * @requires dependency-graph - Install with: npm install dependency-graph
 * @requires import { DepGraph } from 'dependency-graph';
 *
 * @param variables - The variables to resolve
 * @returns Resolved variables with all composite references expanded
 */
const resolveCompositeVariables = (variables: Variables): Variables => {
  const resolved: Variables = { ...variables };
  const graph = new DepGraph();

  // Add all variables as nodes
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
          try {
            // Only add dependency if the referenced variable exists
            if (trimmedRef in variables) {
              graph.addDependency(key, trimmedRef);
            }
          } catch (error) {
            // Circular dependency detected
            // Logger.warn(`Circular dependency detected: ${error.message}`);
            console.log(`!!!Circular dependency detected: ${error.message}`);
          }
        });
      }
    }
  });

  // Get resolution order (topologically sorted)
  let resolutionOrder: string[];
  try {
    resolutionOrder = graph.overallOrder();
  } catch (error) {
    Logger.error("Failed to resolve variable dependencies:", error);
    console.error("!!!Failed to resolve variable dependencies:", error);
    return resolved;
  }

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
      const { wrappedTemplate } = collectAndEscapeVariablesFromTemplate(value, resolved);
      const hbsTemplate = compile(wrappedTemplate, { noEscape: true });
      const renderedValue = hbsTemplate(resolved);
      resolved[varName] = renderedValue;
    } catch (e) {
      console.error("Error resolving composite variable:", varName, e);
      // Keep the original value if rendering fails
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
