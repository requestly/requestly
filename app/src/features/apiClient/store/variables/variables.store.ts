import { EnvironmentVariables, EnvironmentVariableValue } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { create } from "zustand";
import { VariableData, VariableKey } from "./types";

export type VariablesState<T extends VariableData> = {
  // state
  data: Map<VariableKey, T>;

  reset: (data?: Map<VariableKey, T>) => void;

  // actions
  delete: (key: VariableKey) => void;
  add: (key: VariableKey, variable: T) => void;
  update: (key: VariableKey, updates: Omit<T, "id">) => void;
  getVariable: (key: VariableKey) => T | undefined;
  getAll: () => Map<VariableKey, T>;
  search: (value: string) => Map<VariableKey, T>;
};

export const parseVariables = (rawVariables: EnvironmentVariables): VariablesState<VariableData>["data"] => {
  return new Map(Object.entries(rawVariables));
};

export const createVariablesStore = ({ variables }: { variables: EnvironmentVariables }) => {
  return create<VariablesState<EnvironmentVariableValue>>()((set, get) => ({
    data: parseVariables(variables),

    reset(data) {
      set({
        data: data ?? new Map(),
      });
    },

    delete(key) {
      const { data: oldData } = get();
      const data = new Map(oldData);
      if (!data.has(key)) {
        return;
      }

      data.delete(key);
      set({ data });
    },

    add(key, variable) {
      const { data: oldData } = get();
      const data = new Map(oldData);
      data.set(key, variable);
      set({ data });
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
