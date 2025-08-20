import { VariableScope } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { VariablesState } from "features/apiClient/store/variables/variables.store";
import { RQAPI } from "features/apiClient/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { StoreApi } from "zustand";
import { AllApiClientStores } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useActiveEnvironment } from "features/apiClient/hooks/useActiveEnvironment.hook";
import { useApiRecordState } from "features/apiClient/hooks/useApiRecordState.hook";
import { VariableData, VariableKey } from "features/apiClient/store/variables/types";
import { runtimeVariablesStore } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";

type VariableSource = {
  scope: VariableScope;
  scopeId: string;
  name: string;
  level: number;
};

export type ScopedVariable = [VariableData, VariableSource];

type Scope = [VariableSource, StoreApi<VariablesState>];

export type ScopedVariables = Map<VariableKey, ScopedVariable>;

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

  private parseVariableState(state: VariablesState["data"], variableSource: VariableSource) {
    const result: ScopedVariables = new Map();
    for (const [key, value] of state) {
      result.set(key, [value, variableSource]);
    }

    return result;
  }

  refresh(params: { variableSource: VariableSource; variableState: VariablesState }) {
    if (this.isDestroyed) {
      return false;
    }
    const { variableState, variableSource } = params;
    this.data.set(variableSource.level, this.parseVariableState(variableState.data, variableSource));
    return true;
  }

  getAll(): ScopedVariables {
    const result: ScopedVariables = new Map();
    const sortedLevels = Array.from(this.data.keys()).sort();

    for (const level of sortedLevels) {
      const scopedVariable = this.data.get(level);
      if (!scopedVariable) {
        throw new Error("Scoped variable not found for level!");
      }
      for (const [key, value] of scopedVariable) {
        if (!result.has(key)) {
          result.set(key, value);
        }
      }
    }

    return result;
  }

  destroy() {
    this.isDestroyed = true;
  }
}

function getScopes(parents: string[], stores: AllApiClientStores): Scope[] {
  const scopes: Scope[] = [];
  let currentScopeLevel = 0;
  const {
    activeEnvironment: activeEnvironmentStore,
    globalEnvironment: globalEnvironmentStore,
  } = stores.environments.getState();

  const runtimeVaribles = runtimeVariablesStore.getState();
  const activeEnvironment = activeEnvironmentStore?.getState();
  const globalEnvironment = globalEnvironmentStore.getState();

  const { getRecordStore } = stores.records.getState();

  // 0. Runtime Variables
  if (runtimeVaribles) {
    scopes.push([
      {
        scope: VariableScope.RUNTIME,
        scopeId: "runtime",
        name: "Runtime Variables",
        level: currentScopeLevel++,
      },
      runtimeVariablesStore,
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
      activeEnvironment.data.variables,
    ]);
  }

  //2. Collection Variables
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

  //3. Global Environment
  scopes.push([
    {
      scope: VariableScope.GLOBAL,
      scopeId: globalEnvironment.id,
      name: globalEnvironment.name,
      level: currentScopeLevel++,
    },
    globalEnvironment.data.variables,
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
  for (const [variableSource, variableStore] of scopes) {
    variableHolder.refresh({
      variableSource,
      variableState: variableStore.getState(),
    });
  }
}

export function getScopedVariables(parents: string[], stores: AllApiClientStores) {
  const variableHolder = new VariableHolder();
  readScopesIntoVariableHolder(
    {
      scopes: getScopes(parents, stores),
    },
    variableHolder
  );

  return variableHolder.getAll();
}

export function resolveVariable(key: string, parents: string[], stores: AllApiClientStores) {
  return getScopedVariables(parents, stores).get(key);
}

class VariableEventsManager {
  private variableHolder: VariableHolder;
  private map = new Map<
    VariableSource["scopeId"],
    {
      unsubscriber: (...args: any[]) => any[] | void;
    }
  >();

  private resetVariableHolder(scopes: Scope[]) {
    this.variableHolder = new VariableHolder();
    readScopesIntoVariableHolder(
      {
        scopes,
      },
      this.variableHolder
    );
  }

  constructor(private readonly setScopedVariables: (variable: ScopedVariables) => void, scopes: Scope[]) {
    this.resetVariableHolder(scopes);
    scopes.forEach((scope) => this.addScope(scope));
  }

  private addScope(scope: Scope) {
    const [variableSource, variableState] = scope;
    const unsubscriber = variableState.subscribe((variableState) => {
      this.variableHolder.refresh({
        variableSource,
        variableState,
      });
      this.setScopedVariables(this.variableHolder.getAll());
    });
    this.map.set(variableSource.scopeId, {
      unsubscriber,
    });
  }

  private deleteScope(scopeId: VariableSource["scopeId"]) {
    const data = this.map.get(scopeId);
    if (!data) {
      return false;
    }
    data.unsubscriber();
    this.map.delete(scopeId);
    return true;
  }

  refresh(scopes: Scope[]) {
    this.resetVariableHolder(scopes);
    const newScopeIds = new Set(scopes.map((s) => s[0].scopeId));
    for (const scope of scopes) {
      if (!this.map.has(scope[0].scopeId)) {
        this.addScope(scope);
      }
    }

    for (const [scopeId] of this.map) {
      if (!newScopeIds.has(scopeId)) {
        this.deleteScope(scopeId);
      }
    }
  }
}

export function useScopedVariables(id: string) {
  const stores = useApiClientFeatureContext().stores;
  if (!stores) {
    throw new Error("Unable to locate stores!");
  }

  const { version } = useApiRecordState(id);

  const { getParentChain } = stores.records.getState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const parents = useMemo(() => getParentChain(id), [id, version]);

  const activeEnvironment = useActiveEnvironment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scopes = useMemo(() => getScopes(parents, stores), [activeEnvironment, parents, stores]);

  const [scopedVariables, setScopedVariables] = useState(getScopedVariables(parents, stores));

  const variableEventsManagerRef = useRef<VariableEventsManager>();

  useEffect(() => {
    variableEventsManagerRef.current = new VariableEventsManager(setScopedVariables, scopes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    variableEventsManagerRef.current?.refresh(scopes);
    setScopedVariables(getScopedVariables(parents, stores));
  }, [parents, scopes, stores]);

  return scopedVariables;
}
