import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { VariablesState } from "../store/variables/variables.store";

export function useVariableStore<T extends VariablesState>(variableStore: StoreApi<T>) {
  return useStore(
    variableStore,
    useShallow((s) => s)
  );
}
