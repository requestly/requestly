import Dexie, { EntityTable } from "dexie";
import { RuntimeVariableValue } from "./runtimeVariables.store";

const DATABASE_NAME = "runtimeVariable";
const TABLE_NAME = "VARIABLES";

type Metadata = { version: number };
type StoredVariable = { key: string; value: RuntimeVariableValue };

export class PersistedVariablesIDB {
  db: Dexie & {
    [TABLE_NAME]: EntityTable<StoredVariable, "key">;
  };

  constructor(metadata: Metadata) {
    this.db = new Dexie(DATABASE_NAME) as Dexie & {
      [TABLE_NAME]: EntityTable<StoredVariable, "key">;
    };

    this.db.version(metadata.version).stores({
      [TABLE_NAME]: "key",
    });
  }

  async getPersistedRuntimeVariables(): Promise<Map<string, RuntimeVariableValue>> {
    try {
      const storedVariables = await this.db[TABLE_NAME].toArray();
      const variablesMap = new Map<string, RuntimeVariableValue>();

      storedVariables.forEach(({ key, value }) => {
        variablesMap.set(key, value);
      });

      return variablesMap;
    } catch (error) {
      console.error("Failed to load persistent variables:", error);
      return new Map();
    }
  }

  async savePersistedVariables(variables: Map<string, RuntimeVariableValue>): Promise<void> {
    try {
      const persistedEntries: StoredVariable[] = [];

      // Only store variables where isPersisted === true
      for (const [key, value] of variables) {
        if (value.isPersisted) {
          persistedEntries.push({ key, value });
        }
      }

      await this.db.transaction("rw", this.db[TABLE_NAME], async () => {
        await this.db[TABLE_NAME].clear();
        if (persistedEntries.length > 0) {
          await this.db[TABLE_NAME].bulkAdd(persistedEntries);
        }
      });
    } catch (error) {
      console.error("Failed to save persistent variables:", error);
    }
  }

  async deleteVariable(key: string): Promise<void> {
    try {
      await this.db[TABLE_NAME].delete(key);
    } catch (error) {
      console.error("Failed to delete persistent variable:", error);
    }
  }
}
