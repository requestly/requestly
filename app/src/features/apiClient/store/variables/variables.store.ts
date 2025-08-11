import { EnvironmentVariableKey, EnvironmentVariables, EnvironmentVariableValue } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type VariablesState = {
  data: Map<EnvironmentVariableKey, EnvironmentVariableValue>;

  reset: (data: Map<EnvironmentVariableKey, EnvironmentVariableValue>) => void;
  delete: (key: EnvironmentVariableKey) => void;
  add: (key: EnvironmentVariableKey, variable: EnvironmentVariableValue) => void;
  update: (key: EnvironmentVariableKey, updates: Omit<EnvironmentVariableValue, "id">) => void;
  getVariable: (key: EnvironmentVariableKey) => EnvironmentVariableValue | undefined;
  getAll: () => Map<EnvironmentVariableKey, EnvironmentVariableValue>;
  search: (value: string) => Map<EnvironmentVariableKey, EnvironmentVariableValue>;
};

export const parseVariables = (rawVariables: EnvironmentVariables): VariablesState["data"] => {
  return new Map(Object.entries(rawVariables));
};

export const createVariablesStore = ({ variables }: { variables: EnvironmentVariables }) => {
  return create<VariablesState>()(
    immer((set, get) => ({
      data: parseVariables(variables),

      reset(data) {
        set((state) => {
          state.data = data;
        });
      },

      delete(key) {
        const { data } = get();

        if (!data.has(key)) {
          return;
        }

        set((state) => {
          state.data.delete(key);
        });
      },

      add(key, variable) {
        set((state) => {
          state.data.set(key, variable);
        });
      },

      update(key, updates) {
        const { data } = get();
        const existingValue = data.get(key);

        if (!existingValue) {
          throw new NativeError("Variable does not exist!").addContext({ variableKey: key });
        }

        const updatedValue = { ...existingValue, ...updates };

        set((state) => {
          state.data.set(key, updatedValue);
        });
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
    }))
  );
};
