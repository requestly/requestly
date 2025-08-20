import Dexie, { EntityTable } from "dexie";
import { NewVariableData } from "../variables/types";

interface StoredVariable {
  key: string;
  localValue: NewVariableData["localValue"];
}

const db = new Dexie("persistedVariables") as Dexie & {
  [tableName: string]: EntityTable<StoredVariable, "key">;
};

const registeredTables = new Set<string>();

export namespace VariablePersistence {
  export namespace TableId {
    export function runtime(): string {
      return "runtime";
    }

    export function environment(contextId: string, envId?: string): string {
      return envId ? `${contextId}.env.${envId}` : `${contextId}.env.global`;
    }

    export function collection(contextId: string, recordId: string): string {
      return `${contextId}.collection.${recordId}`;
    }

    export function parse(tableId: string): {
      type: 'runtime' | 'environment' | 'collection';
      contextId?: string;
      envId?: string;
      recordId?: string;
      isGlobal?: boolean;
    } {
      if (tableId === "runtime") {
        return { type: 'runtime' };
      }

      const parts = tableId.split('.');
      
      if (parts.length >= 3) {
        const [contextId, type, id] = parts;
        
        if (type === 'env') {
          return {
            type: 'environment',
            contextId,
            envId: id === 'global' ? undefined : id,
            isGlobal: id === 'global'
          };
        }
        
        if (type === 'collection') {
          return {
            type: 'collection',
            contextId,
            recordId: id
          };
        }
      }

      throw new Error(`Invalid table ID format: ${tableId}`);
    }
  }

  function ensureTable(tableId: string, version: number = 1): void {
    if (!registeredTables.has(tableId)) {
      const stores: { [key: string]: string } = {};
      
      registeredTables.add(tableId);
      registeredTables.forEach(table => {
        stores[table] = "key";
      });

      db.version(version).stores(stores);
    }
  }

  export abstract class Store {
    private tableId: string;

    constructor(tableId: string, version: number = 1) {
      this.tableId = tableId;
      ensureTable(tableId, version);
    }

    async delete(key: string): Promise<void> {
      try {
        await db[this.tableId].delete(key);
      } catch (error) {
        console.error(`Failed to delete ${key}:`, error);
      }
    }

    async getAllEntries(): Promise<Map<string, NewVariableData["localValue"]>> {
      try {
        const stored = await db[this.tableId].toArray();
        const result = new Map<string, NewVariableData["localValue"]>();
        stored.forEach(({ key, localValue }) => result.set(key, localValue));
        return result;
      } catch (error) {
        console.error("Failed to get all variables:", error);
        return new Map();
      }
    }

    async persistAll(variables: Map<string, { localValue?: NewVariableData["localValue"] }>): Promise<void> {
      try {
        const entries = Array.from(variables.entries())
          .filter(([, variable]) => variable.localValue !== undefined)
          .map(([key, variable]) => ({ key, localValue: variable.localValue }));

        await db.transaction("rw", db[this.tableId], async () => {
          await db[this.tableId].clear();
          if (entries.length > 0) {
            await db[this.tableId].bulkAdd(entries);
          }
        });
      } catch (error) {
        console.error("Failed to persist dump:", error);
      }
    }

    async persist(variables: Map<string, { isPersisted?: boolean; localValue?: NewVariableData["localValue"] }>): Promise<void> {
      try {
        const entries = Array.from(variables.entries())
          .filter(([, variable]) => variable.isPersisted && variable.localValue !== undefined)
          .map(([key, variable]) => ({ key, localValue: variable.localValue }));

        await db.transaction("rw", db[this.tableId], async () => {
          await db[this.tableId].clear();
          if (entries.length > 0) {
            await db[this.tableId].bulkAdd(entries);
          }
        });
      } catch (error) {
        console.error("Failed to persist runtime dump:", error);
      }
    }

    abstract hydrate<T extends { localValue?: NewVariableData["localValue"] }>(
      initialVariables: Map<string, T>
    ): Promise<Map<string, T>>

    async hydrateAll<T extends { localValue?: NewVariableData["localValue"] }>(
      initialVariables: Map<string, T>
    ): Promise<Map<string, T>> {
      const persistedEntries = await this.getAllEntries();
      const intialEntries = new Map(initialVariables);
      const finalEntries = new Map()
      for (const [key, localValue] of persistedEntries) {
        // @ts-ignore todo: fix this somehow
        let entry : T = {localValue, isPersisted: true}
        const existing = intialEntries.get(key);
        if (existing) {
          entry = { ...existing, localValue };
        }
        finalEntries.set(key, entry)
      }
      
      return finalEntries;
    }

  }

  class RuntimeStore extends Store {
    async hydrate<T extends { localValue?: NewVariableData["localValue"]; }>(initialVariables: Map<string, T>): Promise<Map<string, T>> {
      const persistedEntries = await this.getAllEntries();
      const intialEntries = new Map(initialVariables);
      const finalEntries = new Map()
      for (const [key, localValue] of persistedEntries) {
        // @ts-ignore todo: fix this somehow
        let entry : T = {localValue, isPersisted: true}
        const existing = intialEntries.get(key);
        if (existing) {
          entry = { ...existing, localValue };
        }
        finalEntries.set(key, entry)
      }
      
      return finalEntries;
    }
  }

  class EnvironmentStore extends Store {
    async hydrate<T extends { localValue?: NewVariableData["localValue"] }>(
      initialVariables: Map<string, T>
    ): Promise<Map<string, T>> {
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
  }

  export function createRuntimeStore(): Store {
    return new RuntimeStore(TableId.runtime());
  }

  export function environmentStorePersistance(contextId: string, envId: string): Store {
    return new EnvironmentStore(TableId.environment(contextId, envId));
  }

  export function collectionStorePersistance(contextId: string, recordId: string): Store {
    return new EnvironmentStore(TableId.collection(contextId, recordId));
  }

  
}


