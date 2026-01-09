import { createContext, ReactNode, useMemo } from "react";
import { StoreApi } from "zustand";
import { HeadersStore, createHeadersStore } from "./headersStore";
import { RQAPI } from "../types";

export const HeadersStoreContext = createContext<StoreApi<HeadersStore> | null>(null);

export const HeadersProvider = ({ children, entry }: { children: ReactNode; entry: RQAPI.HttpApiEntry }) => {
  const store = useMemo(() => createHeadersStore(entry), [entry]);

  return <HeadersStoreContext.Provider value={store}>{children}</HeadersStoreContext.Provider>;
};
