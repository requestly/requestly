import { EnvironmentVariableKey, EnvironmentVariables, EnvironmentVariableValue } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { create } from "zustand";

export type VariablesState = {
  // state
  version: number;
  data: Map<EnvironmentVariableKey, EnvironmentVariableValue>;

  reset: (data: Map<EnvironmentVariableKey, EnvironmentVariableValue>) => void;

  // actions
  delete: (key: EnvironmentVariableKey) => void;
  add: (key: EnvironmentVariableKey, variable: EnvironmentVariableValue) => void;
  update: (key: EnvironmentVariableKey, updates: Omit<EnvironmentVariableValue, "id">) => void;
  getVariable: (key: EnvironmentVariableKey) => EnvironmentVariableValue | undefined;
  getAll: () => Map<EnvironmentVariableKey, EnvironmentVariableValue>;
  search: (value: string) => Map<EnvironmentVariableKey, EnvironmentVariableValue>;
  incrementVersion: () => void;
};

export const parseVariables = (rawVariables: EnvironmentVariables): VariablesState["data"] => {
  return new Map(Object.entries(rawVariables));
};

export const createVariablesStore = ({ variables }: { variables: EnvironmentVariables }) => {
  return create<VariablesState>()((set, get) => ({
    version: 0,
    data: parseVariables(variables),

    reset(data) {
      set({
        data,
      });
    },

    delete(key) {
      const { data } = get();

      if (!data.has(key)) {
        return;
      }

      data.delete(key);
      set({ data });
      get().incrementVersion();
    },

    add(key, variable) {
      const { data } = get();
      data.set(key, variable);
      set({ data });
      get().incrementVersion();
    },

    update(key, updates) {
      const { data } = get();
      const existingValue = data.get(key);

      if (!existingValue) {
        throw new NativeError("Variable does not exist!").addContext({ variableKey: key });
      }

      const updatedValue = { ...existingValue, ...updates };
      data.set(key, updatedValue);
      set({ data });
      get().incrementVersion();
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

    incrementVersion() {
      set({
        version: get().version + 1,
      });
    },
  }));
};
