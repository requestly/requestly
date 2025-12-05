import { NativeError } from "errors/NativeError";
import { create } from "zustand";
import { EnvironmentVariableData, VariableData, VariableValues, VariableKey } from "./types";
import { PersistedVariables } from "../shared/variablePersistence";
import { EnvironmentVariables, EnvironmentVariableType, VariableValueType } from "backend/environment/types";

type _VariablesState<T extends VariableData> = {
  data: Map<VariableKey, T>;

  reset: (data?: Map<VariableKey, T>) => void;
  resetSyncValues: (data: Map<VariableKey, T>) => void;

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

const getVariableType = (value: VariableValueType): EnvironmentVariableType => {
  switch (typeof value) {
    case "string":
      return EnvironmentVariableType.String;
    case "number":
      return EnvironmentVariableType.Number;
    case "boolean":
      return EnvironmentVariableType.Boolean;
    default:
      return EnvironmentVariableType.String;
  }
};

const parsePrimitiveVariables = (variableRecord: Record<string, VariableValueType>): Map<VariableKey, VariableData> => {
  const parsedEntries = Object.entries(variableRecord).map(([key, value], index) => {
    const variableData: VariableData = {
      id: index,
      type: getVariableType(value),
      syncValue: value,
      localValue: value,
    };
    return [key, variableData] as [VariableKey, VariableData];
  });
  return new Map(parsedEntries);
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

    resetSyncValues(data) {
      const newData = data ? new Map(data) : new Map();
      const { data: currentData, reset } = get();

      newData.forEach((val, key) => {
        if (currentData.has(key)) {
          newData.set(key, { ...val, localValue: currentData?.get(key)?.localValue });
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

const _createDummyVariablesStore = (data: Map<VariableKey, VariableData>) => {
  return create<VariablesState>()((_, get) => ({
    data,

    reset() {},

    resetSyncValues() {},

    delete() {},

    add() {},

    update() {},

    getVariable(key) {
      const { data } = get();

      return data.get(key);
    },

    getAll() {
      const { data } = get();
      return data;
    },

    search(value) {
      const { data } = get();
      const searchResults = Array.from(data.entries()).filter(([key]) =>
        key.toLowerCase().includes(value.toLowerCase())
      );
      return new Map(searchResults);
    },
  }));
};

/**
 * Creates a dummy variables store from primitive values (string, number, boolean).
 */
export const createDummyVariablesStoreFromPrimitives = (variables: Record<string, VariableValueType>) => {
  const data = parsePrimitiveVariables(variables);
  return _createDummyVariablesStore(data);
};

/**
 * Creates a dummy variables store from VariableData objects.
 */
export const createDummyVariablesStoreFromData = (variables: Record<string, VariableData>) => {
  const data = new Map(Object.entries(variables));
  return _createDummyVariablesStore(data);
};
