import { EnvironmentVariableKey, EnvironmentVariables, EnvironmentVariableValue } from "backend/environment/types";
import { create } from "zustand";

export type VariablesStore = {
  // state
  data: Map<EnvironmentVariableKey, EnvironmentVariableValue>;

  // actions
  delete: (key: EnvironmentVariableKey) => void;
  add: (key: EnvironmentVariableKey, variable: EnvironmentVariableValue) => void;
  update: (key: EnvironmentVariableKey, updates: Omit<EnvironmentVariableValue, "id">) => void;
  get: (key: EnvironmentVariableKey) => EnvironmentVariableValue;
  getAll: () => Map<EnvironmentVariableKey, EnvironmentVariableValue>;
  search: (value: string) => Map<EnvironmentVariableKey, EnvironmentVariableValue>;
};

export const createVariablesStore = ({ variables }: { variables: EnvironmentVariables }) => {
  // Need a way to tell parent that variable is updated
  return create<VariablesStore>()((set, get) => ({
    data: new Map(Object.entries(variables)),

    delete(key) {
      const { data } = get();
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
      const updatedValue = { ...existingValue, ...updates };

      data.set(key, updatedValue);
      set({ data });
    },

    get(key) {
      const { data } = get();
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
