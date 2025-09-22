import React, { createContext, useEffect, useMemo } from "react";
import { StoreApi } from "zustand";
import { createRunConfigStore, RunConfigState } from "./runConfig.store";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { isApiRequest } from "features/apiClient/screens/apiClient/utils";
import { useChildren } from "features/apiClient/hooks/useChildren.hook";
import { useCollectionView } from "features/apiClient/screens/apiClient/components/views/components/Collection/collectionView.context";

export const RunConfigStoreContext = createContext<StoreApi<RunConfigState> | null>(null);

export const RunConfigStoreContextProvider: React.FC<{
  runConfig: SavedRunConfig;
  children: React.ReactNode;
}> = ({ runConfig, children }) => {
  const { collectionId } = useCollectionView();
  const records = useChildren(collectionId);
  const requests = useMemo(() => records.filter(isApiRequest), [records]);

  const store = useMemo(() => {
    const data = { id: runConfig.id, runOrder: runConfig.runOrder, unorderedRequests: requests };
    return createRunConfigStore(data);
  }, [requests, runConfig.id, runConfig.runOrder]);

  useEffect(() => {
    store.getState().patchOrderedRequests(requests);
  }, [requests, store]);

  return <RunConfigStoreContext.Provider value={store}>{children}</RunConfigStoreContext.Provider>;
};
