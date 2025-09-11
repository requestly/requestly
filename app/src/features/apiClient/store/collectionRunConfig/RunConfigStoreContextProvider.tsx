import React, { createContext, useMemo } from "react";
import { StoreApi } from "zustand";
import { createRunConfigStore, RunConfigState } from "./runConfig.store";
import { RQAPI } from "features/apiClient/types";

export const RunConfigStoreContext = createContext<StoreApi<RunConfigState> | null>(null);

export const RunConfigStoreContextProvider: React.FC<{
  runConfig: Partial<RQAPI.RunConfig>;
  children: React.ReactNode;
}> = ({ runConfig, children }) => {
  const store = useMemo(() => {
    const data = { id: runConfig.id, runOrder: runConfig.runOrder };
    return createRunConfigStore(data);
  }, [runConfig]);

  return <RunConfigStoreContext.Provider value={store}>{children}</RunConfigStoreContext.Provider>;
};
