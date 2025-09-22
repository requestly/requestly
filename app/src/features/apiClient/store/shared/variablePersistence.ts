import Dexie, { EntityTable } from "dexie";
import { EnvironmentVariableData, VariableData, IVariableValues } from "../variables/types";
import { createVariablesStore, EnvVariableState, VariablesState } from "../variables/variables.store";
import { RuntimeVariableStore as ExternalRNStore } from "../runtimeVariables/runtimeVariables.store";
import { StoreApi } from "zustand";
import { EnvironmentVariableType } from "backend/environment/types";

interface StoredVariable {
  id: string; // composite key: contextId + key for environments/collections, just key for runtime
  localValue: VariableData["localValue"];
}

const db = new Dexie("persistedVariables") as Dexie & {
  runtime: EntityTable<StoredVariable, "id">;
  environments: EntityTable<StoredVariable, "id">;
  collectionVariables: EntityTable<StoredVariable, "id">;
};

db.version(1).stores({
  runtime: "id, localValue",
  environments: "id, localValue",
  collectionVariables: "id, localValue",
});

function createCompositeKey(contextId: string, variableKey: string): string {
  return `${contextId}::${variableKey}`;
}

function parseCompositeKey(compositeKey: string): { contextId: string; variableKey: string } {
  const [contextId, variableKey] = compositeKey.split("::");
  return { contextId, variableKey };
}
export namespace PersistedVariables {
  export abstract class Store {
    protected contextId: string;
    protected tableName: keyof typeof db;
    loaded: boolean;

    constructor(contextId: string, tableName: keyof typeof db) {
      this.loaded = false;
      this.contextId = contextId;
      this.tableName = tableName;
    }

    async delete(key: string): Promise<void> {
      try {
        const table = db[this.tableName] as EntityTable<StoredVariable, "id">;
        if (this.tableName === "runtime") {
          await table.delete(key);
        } else {
          const compositeKey = createCompositeKey(this.contextId, key);
          await table.delete(compositeKey);
        }
      } catch (error) {
        console.error(`Failed to delete ${key}:`, error);
      }
    }

    async getAllEntries(): Promise<Map<string, VariableData["localValue"]>> {
      try {
        const table = db[this.tableName] as EntityTable<StoredVariable, "id">;
        const result = new Map<string, VariableData["localValue"]>();

        if (this.tableName === "runtime") {
          const stored = await table.toArray();
          stored.forEach(({ id, localValue }: StoredVariable) => result.set(id, localValue));
        } else {
          const stored = await table
            .where("id")
            .startsWith(this.contextId + "::")
            .toArray();

          stored.forEach(({ id, localValue }: StoredVariable) => {
            const { variableKey } = parseCompositeKey(id);
            result.set(variableKey, localValue);
          });
        }
        return result;
      } catch (error) {
        console.error("Failed to get all variables:", error);
        return new Map();
      }
    }

    abstract persist(
      variables: Map<string, { isPersisted?: boolean; localValue?: VariableData["localValue"] }>
    ): Promise<void>;

    abstract hydrate<T extends VariableData>(initialVariables: Map<string, T>): Promise<Map<string, VariableData>>;
  }

  class RuntimeStore extends Store {
    constructor() {
      super("runtime", "runtime");
    }

    async hydrate(): Promise<Map<string, VariableData>> {
      const persistedEntries = await this.getAllEntries();
      const finalEntries = new Map<string, VariableData>();

      let counter = 0;
      for (const [key, localValue] of persistedEntries) {
        let entry: VariableData = {
          localValue,
          type: typeof localValue as EnvironmentVariableType,
          id: counter,
          isPersisted: true,
        };
        finalEntries.set(key, entry);
        counter++;
      }

      return finalEntries;
    }

    async persist(
      variables: Map<string, { isPersisted?: boolean; localValue?: VariableData["localValue"] }>
    ): Promise<void> {
      try {
        const entries = Array.from(variables.entries())
          .filter(([, variable]) => variable.isPersisted && variable.localValue !== undefined)
          .map(([key, variable]) => ({
            id: key, // Runtime uses simple key
            localValue: variable.localValue,
          }));

        await db.transaction("rw", db.runtime, async () => {
          await db.runtime.clear();
          if (entries.length > 0) {
            await db.runtime.bulkAdd(entries);
          }
        });
      } catch (error) {
        console.error("Failed to persist runtime variables:", error);
      }
    }
  }

  class ContextStore extends Store {
    async hydrate<EnvironmentVariableData>(
      initialVariables: Map<string, EnvironmentVariableData>
    ): Promise<Map<string, EnvironmentVariableData>> {
      const persistedEntries = await this.getAllEntries();
      const intialEntries = new Map(initialVariables);

      for (const [key, localValue] of persistedEntries) {
        const existing = intialEntries.get(key);
        if (existing) {
          intialEntries.set(key, { ...existing, localValue });
        }
      }

      return intialEntries;
    }

    async persist(variables: Map<string, { localValue?: VariableData["localValue"] }>): Promise<void> {
      try {
        const entries = Array.from(variables.entries())
          .filter(([, variable]) => variable.localValue !== undefined)
          .map(([key, variable]) => ({
            id: createCompositeKey(this.contextId, key),
            localValue: variable.localValue,
          }));

        const table = db[this.tableName] as EntityTable<StoredVariable, "id">;
        await db.transaction("rw", table, async () => {
          // Clear only this context's entries
          await table
            .where("id")
            .startsWith(this.contextId + "::")
            .delete();

          if (entries.length > 0) {
            await table.bulkAdd(entries);
          }
        });
      } catch (error) {
        console.error(`Failed to persist ${this.tableName} variables:`, error);
      }
    }
  }

  export function createRuntimeStore(): ExternalRNStore {
    const persistence = new RuntimeStore();
    const variablesStore = createVariablesStore();
    return _createPersistedVariableStore(variablesStore, persistence);
  }

  export function createEnvironmentVariablesStore(
    contextId: string,
    envId: string,
    variables: IVariableValues<EnvironmentVariableData>
  ): StoreApi<EnvVariableState> {
    const fullContextId = `${contextId}.${envId}`;
    const persistence = new ContextStore(fullContextId, "environments");
    const variablesStore = createVariablesStore({ variables });
    return _createPersistedVariableStore(variablesStore, persistence) as StoreApi<EnvVariableState>;
  }

  export function createCollectionVariablesStore(
    contextId: string,
    recordId: string,
    variables: IVariableValues<EnvironmentVariableData>
  ): StoreApi<EnvVariableState> {
    const fullContextId = `${contextId}.${recordId}`;
    const persistence = new ContextStore(fullContextId, "collectionVariables");
    const variableStore = createVariablesStore({ variables });
    return _createPersistedVariableStore(variableStore, persistence) as StoreApi<EnvVariableState>;
  }
}

function _createPersistedVariableStore(
  variableStore: StoreApi<VariablesState>,
  persistenceDB: PersistedVariables.Store
): StoreApi<VariablesState> {
  const setupFromPersistedData = async () => {
    const hydrated = await persistenceDB.hydrate(variableStore.getState().data);
    variableStore.setState({
      ...variableStore.getState(),
      data: hydrated,
      _persistence: persistenceDB,
    });

    persistenceDB.loaded = true;
  };
  setupFromPersistedData();

  return variableStore;
}
