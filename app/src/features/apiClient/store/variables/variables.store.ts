import { NativeError } from "errors/NativeError";
import { create } from "zustand";
import { EnvironmentVariableData, VariableData, VariableValues, VariableKey } from "./types";
import { PersistedVariables } from "../shared/variablePersistence";
import { EnvironmentVariables } from "backend/environment/types";

type _VariablesState<T extends VariableData> = {
  data: Map<VariableKey, T>;

  reset: (data?: Map<VariableKey, T>) => void;
  resetSyncValues: (data?: Map<VariableKey, T>) => void;

  delete: (key: VariableKey) => void;
  add: (key: VariableKey, variable: T) => void;
  update: (key: VariableKey, updates: Omit<T, "id">) => void;
  getVariable: (key: VariableKey) => T | undefined;
  getAll: () => Map<VariableKey, T>;
  search: (value: string) => Map<VariableKey, T>;

  // Optional persistence - injected by stores that need it
  _persistence?: PersistedVariables.Store;
};

export type EnvVariableState = _VariablesState<EnvironmentVariableData>;
export type VariablesState = _VariablesState<VariableData>;

export const parseVariables = (rawVariables: VariableValues): VariablesState["data"] => {
  return new Map(Object.entries(rawVariables));
};

export const parseEnvVariables = (rawVariables: EnvironmentVariables): EnvVariableState["data"] => {
  return new Map(Object.entries(rawVariables));
};

export const createVariablesStore = (props?: { variables: VariableValues }) => {
  const variables = props?.variables ?? {};
  return create<VariablesState>()((set, get) => ({
    data: parseVariables(variables),

    reset(data) {
      const newData = data ?? new Map();
      set({ data: newData });
      const persistedDB = get()._persistence;
      if (persistedDB?.loaded) {
        persistedDB?.persist(newData);
      }
    },

    resetSyncValues(newData) {
      const { data: currentData, reset } = get();

      newData.forEach((val, key) => {
        if (currentData.has(key)) {
          newData.set(key, { ...val, localValue: currentData.get(key).localValue });
        }
      });

      reset(newData);
    },

    delete(key) {
      const { data: oldData } = get();
      const data = new Map(oldData);
      if (!data.has(key)) {
        return;
      }

      data.delete(key);
      set({ data });
      get()._persistence?.delete(key);
    },

    add(key, variable) {
      const { data: oldData } = get();
      const data = new Map(oldData);
      data.set(key, variable);
      set({ data });
      const persistedDB = get()._persistence;
      if (persistedDB?.loaded) {
        persistedDB?.persist(data);
      }
    },

    update(key, updates) {
      const { data: oldData } = get();
      const data = new Map(oldData);

      const existingValue = data.get(key);

      if (!existingValue) {
        throw new NativeError("Variable does not exist!").addContext({ variableKey: key });
      }

      const updatedValue = { ...existingValue, ...updates };
      data.set(key, updatedValue);
      set({ data });
      const persistedDB = get()._persistence;
      if (persistedDB?.loaded) {
        persistedDB?.persist(data);
      }
    },

    getVariable(key) {
      const { data } = get();

      if (!data.has(key)) {
        return;
      }

      return data.get(key);
    },

    getAll() {
      const { data } = get();
      return data;
    },

    search(value) {
      const { data } = get();
      const searchResults = Object.entries(data).filter(([key]) => key.toLowerCase().includes(value.toLowerCase()));
      return new Map(searchResults);
    },
  }));
};
