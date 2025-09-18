import React, { createContext, useMemo } from "react";
import { StoreApi } from "zustand";
import { createRunConfigStore, RunConfigState } from "./runConfig.store";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { RQAPI } from "features/apiClient/types";

export const RunConfigStoreContext = createContext<StoreApi<RunConfigState> | null>(null);

export const RunConfigStoreContextProvider: React.FC<{
  runConfig: SavedRunConfig;
  children: React.ReactNode;
}> = ({ runConfig, children }) => {
  const store = useMemo(() => {
    // TODO: Consume useChildren hook here
    const orderedRequests: RQAPI.RunConfig["orderedRequests"] = [];

    const data = { id: runConfig.id, orderedRequests };
    return createRunConfigStore(data);
  }, [runConfig]);

  return <RunConfigStoreContext.Provider value={store}>{children}</RunConfigStoreContext.Provider>;
};
