import Dexie, { EntityTable } from "dexie";
import { RuntimeVariableState, RuntimeVariableValue } from "./runtimeVariables.store";
import { PersistStorage, StorageValue } from "zustand/middleware";

/**
 * Storage identifier for runtime variables store.
 * Used consistently across the persistence layer.
 */
export const RUNTIME_VARIABLES_STORE_NAME = "runtime-variables";

const DATABASE_NAME = "runtimeVariable";

type Metadata = { version: number };
type StoredVariable = { key: string; value: RuntimeVariableValue };

export class PersistedVariablesIDB {
  db: Dexie & {
    [RUNTIME_VARIABLES_STORE_NAME]: EntityTable<StoredVariable, "key">;
  };

  constructor(metadata: Metadata) {
    this.db = new Dexie(DATABASE_NAME) as Dexie & {
      [RUNTIME_VARIABLES_STORE_NAME]: EntityTable<StoredVariable, "key">;
    };

    this.db.version(metadata.version).stores({
      [RUNTIME_VARIABLES_STORE_NAME]: "key",
    });
  }

  get table(): EntityTable<StoredVariable, "key"> {
    return this.db[RUNTIME_VARIABLES_STORE_NAME];
  }
}

type PersistedRuntimeVariableState = Pick<RuntimeVariableState, "data">;

export const createRuntimeVariablePersistStorage = (
  dbHolder: PersistedVariablesIDB
): PersistStorage<PersistedRuntimeVariableState> => ({
  getItem: async (name: string): Promise<StorageValue<PersistedRuntimeVariableState> | null> => {
    try {
      const storedVariables = await dbHolder.table.toArray();

      if (storedVariables.length === 0) {
        return null;
      }

      const variablesMap = new Map<string, RuntimeVariableValue>();
      storedVariables.forEach(({ key, value }) => {
        variablesMap.set(key, value);
      });

      return {
        state: {
          data: variablesMap,
        },
        version: 0,
      };
    } catch (error) {
      console.error(`Failed to load from IndexedDB table '${name}':`, error);
      return null;
    }
  },

  setItem: async (name: string, value: StorageValue<PersistedRuntimeVariableState>): Promise<void> => {
    try {
      const variables = value.state.data;

      const persistedEntries: StoredVariable[] = [];
      for (const [key, variable] of variables) {
        if (variable.isPersisted) {
          persistedEntries.push({ key, value: variable });
        }
      }

      await dbHolder.db.transaction("rw", dbHolder.table, async () => {
        await dbHolder.table.clear();
        if (persistedEntries.length > 0) {
          await dbHolder.table.bulkAdd(persistedEntries);
        }
      });
    } catch (error) {
      console.error(`Failed to save to IndexedDB table '${name}':`, error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await dbHolder.table.clear();
    } catch (error) {
      console.error(`Failed to clear IndexedDB table '${name}':`, error);
    }
  },
});
