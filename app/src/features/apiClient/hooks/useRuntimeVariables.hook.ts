import { useStore } from "zustand";
import { runtimeVariablesStore, RuntimeVariableState } from "../store/runtimeVariables/runtimeVariables.store";
import { useShallow } from "zustand/shallow";

export const useRuntimeVariables = <T>(selector: (state: RuntimeVariableState) => T) => {
  return useStore(runtimeVariablesStore, useShallow(selector));
};
