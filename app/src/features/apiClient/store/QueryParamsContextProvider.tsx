import { createContext, ReactNode, useState } from "react";
import { QueryParamsStore, createQueryParamsStore } from "./queryParamsStore";
import { StoreApi } from "zustand";
import { RQAPI } from "../types";

export const QueryParamsStoreContext = createContext<StoreApi<QueryParamsStore>>(null);

export const QueryParamsProvider = ({ children, entry }: { children: ReactNode; entry: RQAPI.Entry }) => {
  const [store] = useState(() => createQueryParamsStore(entry));
  return <QueryParamsStoreContext.Provider value={store}>{children}</QueryParamsStoreContext.Provider>;
};
