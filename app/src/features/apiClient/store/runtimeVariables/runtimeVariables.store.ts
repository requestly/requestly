import { StoreApi } from "zustand";
import { VariableData } from "../variables/types";
import { VariablesState } from "../variables/variables.store";
import { create } from "zustand";
import { PersistedVariablesIDB } from "./persistedVariables";

export interface RuntimeVariableValue extends VariableData {
  isPersisted: boolean;
}

type RuntimeVariableState = VariablesState<RuntimeVariableValue>;

export type RuntimeVariableStore = StoreApi<RuntimeVariableState>;

const loadPersistedData = async (dbHolder: PersistedVariablesIDB, store: StoreApi<RuntimeVariableState>) => {
  try {
    const persistedVariables = await dbHolder.getPersistedRuntimeVariables();
    const { data: currentData } = store.getState();

    const allVariables = [...currentData.entries(), ...persistedVariables.entries()];
    const mergedVariables = new Map<string, RuntimeVariableValue>();

    allVariables.forEach(([key, variable], index) => {
      mergedVariables.set(key, { ...variable, id: index });
    });

    store.setState({ data: mergedVariables });
  } catch (error) {
    console.error("Failed to load persistent variables:", error);
  }
};

export const createRuntimeVariablesStore = ({ variables }: { variables: RuntimeVariableState["data"] }) => {
  const db = new PersistedVariablesIDB({ version: 1 });

  const persistChanges = async (currentData: Map<string, RuntimeVariableValue>) => {
    await db.savePersistedVariables(currentData);
  };

  const store = create<RuntimeVariableState>()((set, get) => ({
    data: variables,
    version: 0, // to be removed soon
    reset() {
      set({ data: new Map(), version: 0 });
      persistChanges(new Map());
    },
    delete(key) {
      const { data } = get();
      if (!data.has(key)) {
        return;
      }
      const variable = data.get(key);
      const newData = new Map(data);
      newData.delete(key);
      set({ data: newData });

      if (variable.isPersisted) {
        db.deleteVariable(key);
        persistChanges(newData);
      }
    },
    add(key, variable) {
      const { data } = get();
      const newData = new Map(data);
      newData.set(key, variable);
      set({ data: newData });
      persistChanges(newData);
    },
    update(key, updates) {
      const { data } = get();
      const existingValue = data.get(key);
      if (!existingValue) {
        throw new Error(`Variable with key "${key}" does not exist.`);
      }
      const newData = new Map(data);
      newData.set(key, { ...existingValue, ...updates });
      set({ data: newData });
      persistChanges(newData);
    },
    getVariable(key) {
      return get().data.get(key);
    },
    getAll() {
      return get().data;
    },
    search(value) {
      const { data } = get();
      const result = new Map<string, RuntimeVariableValue>();

      for (const [key, variable] of data) {
        if (key.includes(value) || variable.syncValue?.toString().includes(value)) {
          result.set(key, variable);
        }
      }

      return result;
    },
    incrementVersion() {
      const { version } = get();
      set({ version: version + 1 });
    },
  }));

  loadPersistedData(db, store);

  return store;
};

export const runtimeVariablesStore = createRuntimeVariablesStore({ variables: new Map() });
