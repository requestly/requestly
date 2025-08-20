import { EnvironmentVariables } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { create } from "zustand";
import { NewVariableData, VariableKey } from "./types";
import { VariablePersistence } from "../shared/variablePersistence";

export type VariablesState = {
  data: Map<VariableKey, NewVariableData>;

  reset: (data?: Map<VariableKey, NewVariableData>) => void;

  delete: (key: VariableKey) => void;
  add: (key: VariableKey, variable: NewVariableData) => void;
  update: (key: VariableKey, updates: Omit<NewVariableData, "id">) => void;
  getVariable: (key: VariableKey) => NewVariableData | undefined;
  getAll: () => Map<VariableKey, NewVariableData>;
  search: (value: string) => Map<VariableKey, NewVariableData>;
  
  // Optional persistence - injected by stores that need it
  _persistence?: VariablePersistence.Store;
};

export const parseVariables = (rawVariables: EnvironmentVariables): VariablesState["data"] => {
  return new Map(Object.entries(rawVariables));
};

export const createVariablesStore = ({ variables }: { variables: EnvironmentVariables }) => {
  return create<VariablesState>()((set, get) => ({
    data: parseVariables(variables),

    reset(data) {
      const newData = data ?? new Map();
      set({ data: newData });
      get()._persistence?.persistAll(newData);
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
      get()._persistence?.persistAll(data);
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
      get()._persistence?.persistAll(data);
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
