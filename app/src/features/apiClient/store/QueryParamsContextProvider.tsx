import { createContext, ReactNode, useMemo } from "react";
import { QueryParamsStore, createQueryParamsStore } from "./queryParamsStore";
import { StoreApi } from "zustand";
import { RQAPI } from "../types";

export const QueryParamsStoreContext = createContext<StoreApi<QueryParamsStore> | null>(null);

export const QueryParamsProvider = ({ children, entry }: { children: ReactNode; entry: RQAPI.HttpApiEntry }) => {
  const store = useMemo(() => createQueryParamsStore(entry), [entry]);
  return <QueryParamsStoreContext.Provider value={store}>{children}</QueryParamsStoreContext.Provider>;
};
