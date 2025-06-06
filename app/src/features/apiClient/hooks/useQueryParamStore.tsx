import { useContext } from "react";
import { useStore } from "zustand";
import { QueryParamsStore } from "../store/queryParamsStore";
import { QueryParamsStoreContext } from "../store/QueryParamsContextProvider";
import { useShallow } from "zustand/shallow";

export function useQueryParamStore<T>(selector: (state: QueryParamsStore) => T) {
  const store = useContext(QueryParamsStoreContext);

  if (store === null) {
    throw new Error("useQueryParamStore must be used within QueryParamsProvider");
  }

  return useStore(store, useShallow(selector));
}
