import { StoreApi } from "zustand";
import { VariableData } from "./types";
import { VariablesState } from "./variables.store";
import { create } from "zustand";

type RuntimeVariableValue = VariableData;

type RuntimeVariableState = VariablesState<RuntimeVariableValue>;

export type RuntimeVariableStore = StoreApi<RuntimeVariableState>;

export const createRuntimeVariablesStore = ({ variables }: { variables: RuntimeVariableState["data"] }) => {
  return create<RuntimeVariableState>()((set, get) => ({
    data: variables,
    version: 0,
    reset() {
      set({ data: new Map(), version: 0 });
    },
    delete(key) {
      const { data } = get();

      if (!data.has(key)) {
        return;
      }

      data.delete(key);
      set({ data });
    },
    add(key, variable) {
      const { data } = get();
      data.set(key, variable);
      set({ data });
    },
    update(key, updates) {
      const { data } = get();
      const existingValue = data.get(key);

      if (!existingValue) {
        throw new Error(`Variable with key "${key}" does not exist.`);
      }

      data.set(key, { ...existingValue, ...updates });
      set({ data });
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
};

export const runtimeVariablesStore = createRuntimeVariablesStore({ variables: new Map() });
