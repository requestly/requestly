import React, { createContext, useState } from "react";
import { StoreApi } from "zustand";
import { createPathVariablesStore, PathVariablesStore } from "./pathVariables.store";
import { RQAPI } from "features/apiClient/types";

export const PathVariablesStoreContext = createContext<StoreApi<PathVariablesStore> | null>(null);

export const PathVariablesProvider = ({
  children,
  pathVariables,
}: {
  children: React.ReactNode;
  pathVariables: RQAPI.PathVariable[];
}) => {
  const [store] = useState(() => createPathVariablesStore(pathVariables));
  return <PathVariablesStoreContext.Provider value={store}>{children}</PathVariablesStoreContext.Provider>;
};
