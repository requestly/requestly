import React, { createContext, useContext, useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";

const CollectionViewContext = createContext<{ collectionId: RQAPI.CollectionRecord["id"] } | null>(null);

export function useCollectionView() {
  const ctx = useContext(CollectionViewContext);

  if (!ctx) {
    throw new NativeError("useCollectionView must be used within CollectionViewContext");
  }

  return ctx;
}

export const CollectionViewContextProvider: React.FC<{
  children: React.ReactNode;
  collectionId: RQAPI.CollectionRecord["id"];
}> = ({ collectionId, children }) => {
  const value = useMemo(() => ({ collectionId }), [collectionId]);

  return <CollectionViewContext.Provider value={value}>{children}</CollectionViewContext.Provider>;
};
