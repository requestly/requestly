import { useContext } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { PathVariablesStore } from "../store/pathVariables/pathVariables.store";
import { PathVariablesStoreContext } from "../store/pathVariables/PathVariablesContextProvider";
import { useGenericState } from "hooks/useGenericState";
import { RequestViewStore } from "../screens/apiClient/components/views/store";

export function usePathVariablesStore<T>(selector: (state: PathVariablesStore) => T) {
  const { entryStore } = useGenericState();
  
  // Try to get store from entryStore (RequestViewStore) first
  const storeFromEntryStore = entryStore && 'pathVariablesStore' in entryStore.getState() 
    ? (entryStore.getState() as RequestViewStore).pathVariablesStore 
    : null;

  // Fall back to context for backward compatibility
  const storeFromContext = useContext(PathVariablesStoreContext);

  const store = storeFromEntryStore || storeFromContext;

  if (store === null) {
    throw new Error("usePathVariablesStore must be used within PathVariablesProvider or RequestViewStore context");
  }

  return useStore(store, useShallow(selector));
}
