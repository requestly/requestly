import { StoreApi } from "zustand";
import { VariableData } from "../variables/types";
import { VariablesState } from "../variables/variables.store";
import { PersistedVariables } from "../shared/variablePersistence";

export type RuntimeVariableValue = VariableData;

export type RuntimeVariableState = VariablesState;

export type RuntimeVariableStore = StoreApi<RuntimeVariableState>;

export const runtimeVariablesStore = PersistedVariables.createRuntimeStore();
