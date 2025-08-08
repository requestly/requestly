import { EnvironmentVariables, EnvironmentVariableValue } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { create } from "zustand";
import { VariableData, VariableKey } from "./types";

export type VariablesState<T extends VariableData> = {
  // state
  version: number;
  data: Map<VariableKey, T>;

  reset: (data: Map<VariableKey, T>) => void;

  // actions
  delete: (key: VariableKey) => void;
  add: (key: VariableKey, variable: T) => void;
  update: (key: VariableKey, updates: Omit<T, "id">) => void;
  getVariable: (key: VariableKey) => T | undefined;
  getAll: () => Map<VariableKey, T>;
  search: (value: string) => Map<VariableKey, T>;
  incrementVersion: () => void;
};

export const parseVariables = (rawVariables: EnvironmentVariables): VariablesState<VariableData>["data"] => {
  return new Map(Object.entries(rawVariables));
};

export const createVariablesStore = ({ variables }: { variables: EnvironmentVariables }) => {
  return create<VariablesState<EnvironmentVariableValue>>()((set, get) => ({
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
