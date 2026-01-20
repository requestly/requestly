import { useContext } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { PathVariablesStore } from "../store/pathVariables/pathVariables.store";
import { PathVariablesStoreContext } from "../store/pathVariables/PathVariablesContextProvider";

export function usePathVariablesStore<T>(selector: (state: PathVariablesStore) => T) {
  const store = useContext(PathVariablesStoreContext);

  if (store === null) {
    throw new Error("usePathVariablesStore must be used within PathVariablesProvider");
  }

  return useStore(store, useShallow(selector));
}
