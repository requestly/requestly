import { EnvironmentVariables, VariableScope } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import lodash from "lodash";
import { useMemo } from "react";
import { VariableData, VariableKey } from "features/apiClient/store/variables/types";
import { runtimeVariablesStore as _runtimeVariablesStore } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";
import {
  ApiClientStoreState,
  selectActiveEnvironment,
  selectAncestorIds,
  selectGlobalEnvironment,
  selectRecordById,
} from "features/apiClient/slices";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useSelector } from "react-redux";
import { selectRuntimeVariables } from "features/apiClient/slices/runtimeVariables";

export type VariableSource = {
  scope: VariableScope;
  scopeId: string;
  name: string;
  level: number;
};

export type ScopedVariable = [VariableData, VariableSource];

export type Scope = [VariableSource, EnvironmentVariables];

export type ScopedVariables = Record<VariableKey, ScopedVariable>;

/**
 * Configuration for overriding store reads with execution context values.
 * This allows deriving scopes from passed data instead of reading from stores.
 */
export type StoreOverrideConfig = {
  runtimeVariables?: EnvironmentVariables;
  activeEnvironmentVariables?: EnvironmentVariables;
  globalEnvironmentVariables?: EnvironmentVariables;
  collectionVariables?: Partial<{
    [key: string]: EnvironmentVariables;
  }>;
};

/**
 * This class is used to maintains and store variables, keeping in check that scopes that are higher in chain
 * DO NO overwrite variables from scopes lower in chain.
 *
 * For example, if a collection has a variable 'baseUrl' and so does the active enviroment then this class will
 * not allow the collection to overwrite and will make sure that there's only one instance of 'baseUrl' and that
 * it is coming from the active environment.
 */

export class VariableHolder {
  private data = new Map<number, ScopedVariables>();
  private isDestroyed = false;
  public variables: ScopedVariables = {};

  private parseVariableState(variables: EnvironmentVariables, variableSource: VariableSource) {
    const result: ScopedVariables = {};
    for (const key in variables) {
      const variable = variables[key];
      if (!variable) {
        continue;
      }
      result[key] = [variable, variableSource];
    }

    return result;
  }

  refresh(params: { variableSource: VariableSource; variables: EnvironmentVariables }) {
    if (this.isDestroyed) {
      return false;
    }
    const { variables, variableSource } = params;
    this.data.set(variableSource.level, this.parseVariableState(variables, variableSource));
    const newVariables = this.getAll();
    if (!lodash.isEqual(this.variables, newVariables)) {
      this.variables = this.getAll();
    }
    return true;
  }

  private getAll(): ScopedVariables {
    const result: ScopedVariables = {};
    const sortedLevels = Array.from(this.data.keys()).sort();

    for (const level of sortedLevels) {
      const levelledScopedVariables = this.data.get(level);
      if (!levelledScopedVariables) {
        throw new Error("Scoped variable not found for level!");
      }
      for (const key in levelledScopedVariables) {
        if (!(key in result)) {
          result[key] = levelledScopedVariables[key]!;
        }
      }
    }

    return result;
  }

  destroy() {
    this.isDestroyed = true;
  }
}

function getScopes(
  state: ApiClientStoreState,
  runtimeVariables: EnvironmentVariables,
  id: string,
  config?: {
    initialScopes?: Scope[];
    storeOverrideConfig?: StoreOverrideConfig;
  }
): Scope[] {
  const parents = selectAncestorIds(state, id);
  const override = config?.storeOverrideConfig;
  const initialScopes = config?.initialScopes || [];
  let currentScopeLevel = initialScopes.length;
  const scopes: Scope[] = [...initialScopes];
  const activeEnvironment = selectActiveEnvironment(state);
  const globalEnvironment = selectGlobalEnvironment(state);

  // 0. Runtime Variables
  if (runtimeVariables) {
    scopes.push([
      {
        scope: VariableScope.RUNTIME,
        scopeId: "runtime",
        name: "Runtime Variables",
        level: currentScopeLevel++,
      },
      runtimeVariables,
    ]);
  }

  //1. Active Envrionment
  if (activeEnvironment) {
    scopes.push([
      {
        scope: VariableScope.ENVIRONMENT,
        scopeId: activeEnvironment.id,
        name: activeEnvironment.name,
        level: currentScopeLevel++,
      },
      override?.activeEnvironmentVariables || activeEnvironment.variables,
    ]);
  }

  //2. Collection Variables
  for (const parent of [id, ...parents]) {
    const recordState = selectRecordById(state, parent);
    if (recordState?.type === RQAPI.RecordType.COLLECTION) {
      scopes.push([
        {
          scope: VariableScope.COLLECTION,
          scopeId: recordState.id,
          name: recordState.name,
          level: currentScopeLevel++,
        },
        override?.collectionVariables?.[parent] || recordState.data.variables,
      ]);
    }
  }

  //3. Global Environment
  scopes.push([
    {
      scope: VariableScope.GLOBAL,
      scopeId: globalEnvironment.id,
      name: globalEnvironment.name,
      level: currentScopeLevel++,
    },
    override?.globalEnvironmentVariables || globalEnvironment.variables,
  ]);

  return scopes;
}

function readScopesIntoVariableHolder(
  params: {
    scopes: Scope[];
  },
  variableHolder: VariableHolder
) {
  const scopes = params.scopes;
  for (const [variableSource, variables] of scopes) {
    variableHolder.refresh({
      variableSource,
      variables,
    });
  }
}

export function getScopedVariables(
  state: ApiClientStoreState,
  runtimeVariables: EnvironmentVariables,
  id: string,
  config?: {
    variableHolder?: VariableHolder;
    scopes?: Scope[];
    storeOverrideConfig?: StoreOverrideConfig;
  }
): ScopedVariables {
  const variableHolder = config?.variableHolder || new VariableHolder();
  readScopesIntoVariableHolder(
    {
      scopes: getScopes(state, runtimeVariables, id, config),
    },
    variableHolder
  );

  return variableHolder.variables;
}

export function resolveVariable(
  state: ApiClientStoreState,
  runtimeVariables: EnvironmentVariables,
  id: string,
  key: string,
  config: {
    scopes?: Scope[];
    storeOverrideConfig?: StoreOverrideConfig;
  }
) {
  return getScopedVariables(state, runtimeVariables, id, config)[key];
}

export function useScopedVariables(id: string) {
  const variableHolder = useMemo(() => new VariableHolder(), [id]);
  const runtimeVariables = useSelector(selectRuntimeVariables);
  return useApiClientSelector((state: ApiClientStoreState) =>
    getScopedVariables(state, runtimeVariables, id, { variableHolder })
  );
}
