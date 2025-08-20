import { StoreApi } from "zustand";
import { NewVariableData } from "../variables/types";
import { VariablesState } from "../variables/variables.store";
import { create } from "zustand";
import { VariablePersistence } from "../shared/variablePersistence";


export type RuntimeVariableValue = NewVariableData;

export type RuntimeVariableState = VariablesState;

export type RuntimeVariableStore = StoreApi<RuntimeVariableState>;

export const createRuntimeVariablesStore = ({ variables }: { variables: RuntimeVariableState["data"] }) => {
  const persistence = VariablePersistence.createRuntimeStore();
  
  const store = create<RuntimeVariableState>()((set, get) => ({
    data: variables,
    version: 0,
    reset(data) {
      const newData = data ?? new Map();
      set({ data: newData, version: 0 });
    },
    delete(key) {
      const { data } = get();
      if (!data.has(key)) {
        return;
      }
      const newData = new Map(data);
      newData.delete(key);
      set({ data: newData });
    },
    add(key, variable) {
      const { data } = get();
      const newData = new Map(data);
      newData.set(key, variable);
      set({ data: newData });
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
        if (key.includes(value) || variable.localValue?.toString().includes(value) ) {
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

  const loadPersistedData = async () => {
    const hydrated = await persistence.hydrateAll(store.getState().data);
    store.getState().reset(hydrated);
  };
  loadPersistedData();

  return store;
};

export const runtimeVariablesStore = createRuntimeVariablesStore({ variables: new Map() });
