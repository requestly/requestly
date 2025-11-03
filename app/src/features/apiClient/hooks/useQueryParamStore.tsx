import { useContext } from "react";
import { useStore } from "zustand";
import { QueryParamsStore } from "../store/queryParamsStore";
import { QueryParamsStoreContext } from "../store/QueryParamsContextProvider";
import { useShallow } from "zustand/shallow";
import { useGenericState } from "hooks/useGenericState";
import { RequestViewStore } from "../screens/apiClient/components/views/store";

export function useQueryParamStore<T>(selector: (state: QueryParamsStore) => T) {
  const { entryStore } = useGenericState();

  // Try to get store from entryStore (RequestViewStore) first
  const storeFromEntryStore =
    entryStore && "queryParamsStore" in entryStore.getState()
      ? (entryStore.getState() as RequestViewStore).queryParamsStore
      : null;

  // Fall back to context for backward compatibility
  const storeFromContext = useContext(QueryParamsStoreContext);

  const store = storeFromEntryStore || storeFromContext;

  if (store === null) {
    throw new Error("useQueryParamStore must be used within QueryParamsProvider or RequestViewStore context");
  }

  return useStore(store, useShallow(selector));
}
