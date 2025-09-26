import React, { createContext, useContext, useEffect, useMemo } from "react";
import { StoreApi, useStore } from "zustand";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { isApiRequest } from "features/apiClient/screens/apiClient/utils";
import { useChildren } from "features/apiClient/hooks/useChildren.hook";
import { useCollectionView } from "features/apiClient/screens/apiClient/components/views/components/Collection/collectionView.context";
import { createRunConfigStore, RunConfigState } from "features/apiClient/store/collectionRunConfig/runConfig.store";
import {
  createRunResultStore,
  RunResult,
  RunResultState,
} from "features/apiClient/store/collectionRunResult/runResult.store";
import { NativeError } from "errors/NativeError";
import { useShallow } from "zustand/shallow";
import { RQAPI } from "features/apiClient/types";

export type RunContext = {
  runConfigStore: StoreApi<RunConfigState>;
  runResultStore: StoreApi<RunResultState>;
  collectionId: RQAPI.CollectionRecord["id"];
};

const RunViewContext = createContext<RunContext | null>(null);

export const RunViewContextProvider: React.FC<{
  runConfig: SavedRunConfig;
  history: RunResult[];
  children: React.ReactNode;
}> = ({ runConfig, history, children }) => {
  const { collectionId } = useCollectionView();
  const records = useChildren(collectionId);
  const requests = useMemo(() => records.filter(isApiRequest), [records]);

  const runConfigStore = useMemo(() => {
    const data = { id: runConfig.id, runOrder: runConfig.runOrder, unorderedRequests: requests };
    return createRunConfigStore(data);
  }, [requests, runConfig.id, runConfig.runOrder]);

  useEffect(() => {
    runConfigStore.getState().patchOrderedRequests(requests);
  }, [requests, runConfigStore]);

  const value = useMemo(() => {
    return {
      runConfigStore,
      runResultStore: createRunResultStore({ history }),
      collectionId,
    };
  }, [runConfigStore, history, collectionId]);

  return <RunViewContext.Provider value={value}>{children}</RunViewContext.Provider>;
};

export function useRunContext() {
  const ctx = useContext(RunViewContext);

  if (ctx === null) {
    throw new NativeError("useRunContext must be used within RunViewContextProvider");
  }

  return ctx;
}

export function useRunConfigStore<T>(selector: (state: RunConfigState) => T) {
  const ctx = useRunContext();

  if (ctx === null) {
    throw new NativeError("useRunConfigStore must be used within RunViewContextProvider");
  }

  return useStore(ctx.runConfigStore, useShallow(selector));
}

export function useRunResultStore<T>(selector: (state: RunResultState) => T) {
  const ctx = useRunContext();

  if (ctx === null) {
    throw new NativeError("useRunResultStore must be used within RunViewContextProvider");
  }

  return useStore(ctx.runResultStore, useShallow(selector));
}
