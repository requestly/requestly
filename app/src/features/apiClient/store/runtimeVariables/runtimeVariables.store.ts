import { StoreApi } from "zustand";
import { VariableData } from "../variables/types";
import { VariablesState } from "../variables/variables.store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PersistedVariablesIDB,
  createRuntimeVariablePersistStorage,
  RUNTIME_VARIABLES_STORE_NAME,
} from "./persistedVariables";

export interface RuntimeVariableValue extends VariableData {
  isPersisted: boolean;
}

export type RuntimeVariableState = VariablesState<RuntimeVariableValue>;

export type RuntimeVariableStore = StoreApi<RuntimeVariableState>;

export const createRuntimeVariablesStore = ({ variables }: { variables: RuntimeVariableState["data"] }) => {
  const db = new PersistedVariablesIDB({ version: 1 });
  const storage = createRuntimeVariablePersistStorage(db);

  return create<RuntimeVariableState>()(
    persist(
      (set, get) => ({
        data: variables,
        version: 0, // to be removed soon
        reset(data) {
          set({ data, version: 0 });
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
      }),
      {
        name: RUNTIME_VARIABLES_STORE_NAME,
        storage,
        onRehydrateStorage: (state) => (rehydratedState, error) => {
          if (error) {
            console.error("Error during rehydration:", error);
            return;
          }

          if (rehydratedState?.data) {
            const allVariables = [...rehydratedState.data.entries()];
            const reindexedVariables = new Map<string, RuntimeVariableValue>();

            allVariables.forEach(([key, variable], index) => {
              if (variable && typeof variable === "object") {
                reindexedVariables.set(key, { ...variable, id: index });
              }
            });

            // Use the store's set method to actually update the state
            state.reset(reindexedVariables);
          }
        },
      }
    )
  );
};

export const runtimeVariablesStore = createRuntimeVariablesStore({ variables: new Map() });
