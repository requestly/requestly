import { EnvironmentVariableKey, EnvironmentVariableValue, VariableScope } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { RecordState } from "features/apiClient/store/apiRecords/apiRecords.store";
import { Environment, GlobalEnvironment } from "features/apiClient/store/environments/environments.store";
import { VariablesState } from "features/apiClient/store/variables/variables.store";
import { RQAPI } from "features/apiClient/types";
import { useContext, useEffect, useMemo, useState } from "react";
import { StoreApi } from "zustand";
import * as fp from "lodash/fp";
import {
  AllApiClientStores,
  ApiRecordsStoreContext,
} from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";

type VariableSource = {
  scope: VariableScope;
  scopeId: string;
  name: string;
  level: number;
};

export type ScopedVariable = [EnvironmentVariableValue, VariableSource];
export type ScopedVariables = Map<EnvironmentVariableKey, ScopedVariable>;
type Scope = [VariableSource, StoreApi<VariablesState>];
export class VariableHolder {
  private data: ScopedVariables;
  private isDestroyed = false;

  add(params: { key: EnvironmentVariableKey; value: EnvironmentVariableValue; variableSource: VariableSource }) {
    if (this.isDestroyed) {
      return false;
    }
    const { key, value, variableSource } = params;
    const existingEntry = this.data.get(key);
    if (!existingEntry) {
      this.data.set(key, [value, variableSource]);
      return true;
    }

    const [, existingVariableSource] = existingEntry;
    if (variableSource.level > existingVariableSource.level) {
      return false;
    }

    this.data.set(key, [value, variableSource]);
    return true;
  }

  getAll() {
    return this.data;
  }

  destroy() {
    this.isDestroyed = true;
  }
}

function getScopes(parents: string[], stores: AllApiClientStores): Scope[] {
  const scopes: [VariableSource, StoreApi<VariablesState>][] = [];
  let currentScopeLevel = 0;
  const { activeEnvironment, globalEnvironment } = stores.environments.getState();
  const { getRecordStore } = stores.records.getState();

  //1. Active Envrionment
  if (activeEnvironment) {
    scopes.push([
      {
        scope: VariableScope.ENVIRONMENT,
        scopeId: activeEnvironment.id,
        name: activeEnvironment.name,
        level: currentScopeLevel++,
      },
      activeEnvironment.data.variables,
    ]);
  }

  //2. Global Environment
  scopes.push([
    {
      scope: VariableScope.GLOBAL,
      scopeId: globalEnvironment.id,
      name: globalEnvironment.name,
      level: currentScopeLevel++,
    },
    globalEnvironment.data.variables,
  ]);

  //3. Collection Variables
  for (const parent of parents) {
    const recordState = getRecordStore(parent)?.getState();
    if (!recordState) {
      throw new NativeError(`Could not find store for record: ${parent}`);
    }
    if (recordState.type === RQAPI.RecordType.COLLECTION) {
      scopes.push([
        {
          scope: VariableScope.COLLECTION,
          scopeId: recordState.record.id,
          name: recordState.record.name,
          level: currentScopeLevel++,
        },
        recordState.collectionVariables,
      ]);
    }
  }

  return scopes;
}

function readScopes(
  params: {
    parents: string[];
    scopes?: Scope[];
  },
  stores: AllApiClientStores,
  variableHolder = new VariableHolder()
) {
  const { parents } = params;
  const scopes = params.scopes || getScopes(parents, stores);
  for (const [variableSource, variableState] of scopes) {
    for (const [key, value] of variableState.getState().getAll()) {
      variableHolder.add({
        key,
        value,
        variableSource,
      });
    }
  }
}

export namespace VariableResolver {
  export function getScopedVariables(parents: string[], stores: AllApiClientStores) {
    const variableHolder = new VariableHolder();
    readScopes(
      {
        parents,
      },
      stores,
      variableHolder
    );

    return variableHolder.getAll();
  }

  export function resolveVariable(key: string, parents: string[], stores: AllApiClientStores) {
    return getScopedVariables(parents, stores).get(key);
  }

  export function useScopedVariables(id: string, parentVersion: number) {
    const stores = useContext(ApiRecordsStoreContext);
    if (!stores) {
      throw new Error("Unable to locate stores!");
    }
    const { getParentChain } = stores.records.getState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const parents = useMemo(() => getParentChain(id), [id, parentVersion]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const variableHolder = useMemo(() => new VariableHolder(), [parents]);

    const scopes = useMemo(() => getScopes(parents, stores), [id, parents]);

    readScopes(
      {
        parents,
        scopes,
      },
      stores,
      variableHolder
    );

    const [scopedVariables, setScopedVariables] = useState(variableHolder.getAll());

    useEffect(() => {
      const unsubscribers: ((...args: any[]) => any[] | void)[] = [];
      scopes.forEach(([variableSource, variableState], index) => {
        const unsubscriber = variableState.subscribe((state) => {
          for (const [key, value] of state.data) {
            variableHolder.add({
              key,
              value,
              variableSource,
            });
          }
          setScopedVariables(variableHolder.getAll());
        });
        unsubscribers.push(unsubscriber);
      });

      return () => {
        fp.flow(unsubscribers);
        variableHolder.destroy();
      };
    }, [scopes, variableHolder]);

    return scopedVariables;
  }
}
