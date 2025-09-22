import React, { createContext, useEffect, useMemo } from "react";
import { StoreApi } from "zustand";
import { createRunConfigStore, RunConfigState } from "./runConfig.store";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { useAPIRecords } from "../apiRecords/ApiRecordsContextProvider";
import { isApiRequest } from "features/apiClient/screens/apiClient/utils";

export const RunConfigStoreContext = createContext<StoreApi<RunConfigState> | null>(null);

export const RunConfigStoreContextProvider: React.FC<{
  runConfig: SavedRunConfig;
  children: React.ReactNode;
}> = ({ runConfig, children }) => {
  const apiClientRecords = useAPIRecords((s) => s.apiClientRecords);
  const requests = useMemo(() => apiClientRecords.filter(isApiRequest), [apiClientRecords]);

  const store = useMemo(() => {
    const data = { id: runConfig.id, runOrder: runConfig.runOrder, unorderedRequests: requests };
    return createRunConfigStore(data);
  }, [requests, runConfig.id, runConfig.runOrder]);

  useEffect(() => {
    store.getState().patchOrderedRequests(requests);
  }, [requests, store]);

  return <RunConfigStoreContext.Provider value={store}>{children}</RunConfigStoreContext.Provider>;
};
