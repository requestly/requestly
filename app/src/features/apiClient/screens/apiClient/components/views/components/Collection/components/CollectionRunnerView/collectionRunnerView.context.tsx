import React, { createContext, useContext, useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";

const CollectionRunnerViewContext = createContext<{ collectionId: RQAPI.CollectionRecord["id"] } | null>(null);

export function useCollectionRunnerView() {
  const ctx = useContext(CollectionRunnerViewContext);

  if (!ctx) {
    throw new NativeError("useCollectionRunnerView must be used within CollectionRunnerViewContext");
  }

  return ctx;
}

export const CollectionRunnerViewContextProvider: React.FC<{
  children: React.ReactNode;
  collectionId: RQAPI.CollectionRecord["id"];
}> = ({ collectionId, children }) => {
  const value = useMemo(() => ({ collectionId }), [collectionId]);

  return <CollectionRunnerViewContext.Provider value={value}>{children}</CollectionRunnerViewContext.Provider>;
};
