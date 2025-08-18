import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { VariablesState } from "../store/variables/variables.store";

export function useVariableStore(variableStore: StoreApi<VariablesState>) {
  return useStore(
    variableStore,
    useShallow((s) => s)
  );
}
