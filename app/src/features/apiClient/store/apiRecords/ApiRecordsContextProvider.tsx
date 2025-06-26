import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { ApiRecordsState, createApiRecordsStore } from "./apiRecords.store";
import { RQAPI } from "features/apiClient/types";
import { useShallow } from "zustand/shallow";

export const ApiRecordsStoreContext = createContext<StoreApi<ApiRecordsState>>(null);

export const ApiRecordsProvider = ({ children, records }: { children: ReactNode; records: RQAPI.Record[] }) => {
  const [store] = useState(() => createApiRecordsStore(records));

  useEffect(() => {
    store.getState().refresh(records);
  }, [records]);

  return <ApiRecordsStoreContext.Provider value={store}>{children}</ApiRecordsStoreContext.Provider>;
};

export function useAPIRecords<T>(selector: (state: ApiRecordsState) => T) {
  const store = useContext(ApiRecordsStoreContext);
  if (!store) {
    throw new Error("store not found!");
  }

  return useStore(store, useShallow(selector));
}
