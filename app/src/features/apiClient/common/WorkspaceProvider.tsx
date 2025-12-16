import React, { createContext } from "react";
import { createDispatchHook, createSelectorHook, createStoreHook, Provider, ReactReduxContextValue } from "react-redux";
import { ApiClientStoreState, useApiClientStore } from "../slices";

const WorkspaceStoreContext = createContext<ReactReduxContextValue<ApiClientStoreState> | null>(null);

export const useWorkspaceViewStore = createStoreHook(WorkspaceStoreContext);
export const useWorkspaceViewDispatch = createDispatchHook(WorkspaceStoreContext);

// TODO: integrate selector with records slice
export const useWorkspaceViewSelector = createSelectorHook(WorkspaceStoreContext);

export function WorkspaceProvider(props: { workspaceId: string; children: React.ReactNode }) {
  const store = useApiClientStore(props.workspaceId);

  return (
    <Provider context={WorkspaceStoreContext} store={store}>
      {props.children}
    </Provider>
  );
}
