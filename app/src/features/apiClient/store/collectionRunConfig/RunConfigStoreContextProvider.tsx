import React, { createContext, useMemo } from "react";
import { StoreApi } from "zustand";
import { createRunConfigStore, RunConfigState } from "./runConfig.store";
import { RQAPI } from "features/apiClient/types";

export const RunConfigStoreContext = createContext<StoreApi<RunConfigState> | null>(null);

export const RunConfigStoreContextProvider: React.FC<{ runConfig: RQAPI.RunConfig; children: React.ReactNode }> = ({
  runConfig,
  children,
}) => {
  const store = useMemo(() => {
    return createRunConfigStore(runConfig);
  }, [runConfig]);

  return <RunConfigStoreContext.Provider value={store}>{children}</RunConfigStoreContext.Provider>;
};
