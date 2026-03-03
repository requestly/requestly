import { variableResolver } from "../../../../lib/dynamic-variables";
import { DynamicVariable } from "../../../../lib/dynamic-variables/types";
import { VariableScope } from "../../../../backend/environment/types";
import { secretVariables } from "../../../../lib/secret-variables";
import { ScopedVariable, ScopedVariables } from "./variable-resolver";
import { SecretVariable } from "lib/secret-variables/types";

export type Variable = ScopedVariable | DynamicVariable | SecretVariable;
export type Variables = Record<string, Variable>;

export interface AutocompleteItem {
  name: string;
  displayName: string;
  variable: Variable;
  isNamespace: boolean; // Decides if its a namespace variable and can contain more variables (we show chevron in this case)
}

export function getVariable(key: string, scopedVariables?: ScopedVariables): Variable | undefined {
  return scopedVariables?.[key] || variableResolver.getVariable(key) || secretVariables.getSecretsVariable(key);
}

export function hasVariable(key: string, scopedVariables?: ScopedVariables): boolean {
  return !!scopedVariables?.[key] || variableResolver.has(key) || secretVariables.hasSecretsPath(key);
}

export function checkIsDynamicVariable(variable: Variable): variable is DynamicVariable {
  return (variable as DynamicVariable).scope === VariableScope.DYNAMIC;
}

export function checkIsSecretsVariable(variable: Variable): variable is SecretVariable {
  return (variable as SecretVariable).scope === VariableScope.SECRETS;
}

export function mergeAndParseAllVariables(scopedVariables?: ScopedVariables): Variables {
  const unified: Variables = {};

  // Add scoped variables first so they appear before dynamic and secrets
  if (scopedVariables) Object.assign(unified, scopedVariables);
  variableResolver.listAll().forEach((v) => {
    if (!unified[v.name]) {
      unified[v.name] = v;
    }
  });

  // Add secrets variables that don't conflict
  secretVariables.getSecretsList().forEach((v) => {
    if (!unified[v.name]) {
      unified[v.name] = v;
    }
  });
  return unified;
}

function matchFlatVariables(variables: Variables, search: string): AutocompleteItem[] {
  return Object.entries(variables)
    .filter(([key, v]) => !checkIsSecretsVariable(v) && key.toLowerCase().includes(search))
    .map(([key, v]) => ({ name: key, displayName: key, variable: v, isNamespace: false }));
}

/**
 * Matches secret variables hierarchically using dot-separated paths.
 *
 * Given search "secrets.cities.n", `parentPath` is "secrets.cities." and
 * `filterText` is "n". Only keys under that parent are considered, and only
 * the next path segment is exposed — deeper segments collapse into a
 * drillable namespace entry.
 */
function matchHierarchicalSecrets(variables: Variables, search: string): AutocompleteItem[] {
  const lastDot = search.lastIndexOf(".");
  const parentPath = lastDot >= 0 ? search.slice(0, lastDot + 1) : "";
  const filterText = lastDot >= 0 ? search.slice(lastDot + 1) : search;

  const items: AutocompleteItem[] = [];
  const seenNamespaces = new Set<string>();

  for (const [key, variable] of Object.entries(variables)) {
    if (!checkIsSecretsVariable(variable)) {
      continue;
    }

    if (!key.toLowerCase().startsWith(parentPath)) {
      continue;
    }

    const remaining = key.slice(parentPath.length);
    const nextDot = remaining.indexOf(".");
    const isNamespace = nextDot >= 0;
    // For key "secrets.cities.paris" with parentPath "secrets.":
    //   segment   = "cities"          (the immediate child label shown in the dropdown)
    //   entryName = "secrets.cities"  (the full path up to this level, used as the item key)
    const segment = isNamespace ? remaining.slice(0, nextDot) : remaining;
    const entryName = isNamespace ? key.slice(0, parentPath.length + nextDot) : key;

    if (filterText && !segment.toLowerCase().includes(filterText)) {
      continue;
    }

    if (isNamespace) {
      const normalized = entryName.toLowerCase();
      if (seenNamespaces.has(normalized)) {
        continue;
      }
      seenNamespaces.add(normalized);
    }

    items.push({
      name: entryName,
      displayName: parentPath ? segment : entryName,
      variable: isNamespace
        ? ({ name: entryName, value: "", id: entryName, scope: VariableScope.SECRETS } as SecretVariable)
        : variable,
      isNamespace,
    });
  }

  return items;
}

/**
 * Builds autocomplete items with hierarchical support for secrets.
 *
 * Non-secret variables use simple substring matching.
 * Secret variables are grouped by the next path segment so that intermediate
 * namespaces (e.g. "secrets.cities") appear as drillable entries instead of
 * showing every fully-qualified leaf path at once.
 */
export function getHierarchicalAutocompleteItems(allVariables: Variables, search: string): AutocompleteItem[] {
  const normalizedSearch = (search || "").toLowerCase();
  return [
    ...matchFlatVariables(allVariables, normalizedSearch),
    ...matchHierarchicalSecrets(allVariables, normalizedSearch),
  ];
}
