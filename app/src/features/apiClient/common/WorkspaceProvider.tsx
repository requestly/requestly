import React, { createContext } from "react";
import {
  createDispatchHook,
  createSelectorHook,
  createStoreHook,
  Provider,
  ReactReduxContextValue,
  TypedUseSelectorHook,
} from "react-redux";
import { ApiClientStoreState, useApiClientStore } from "../slices";
import { Workspace } from "features/workspaces/types";

const WorkspaceStoreContext = createContext<ReactReduxContextValue<ApiClientStoreState> | null>(null);

export const useWorkspaceViewStore = createStoreHook(WorkspaceStoreContext);
export const useWorkspaceViewDispatch = createDispatchHook(WorkspaceStoreContext);

// TODO: integrate selector with records slice
export const useWorkspaceViewSelector: TypedUseSelectorHook<ApiClientStoreState> = createSelectorHook(
  WorkspaceStoreContext
);

export function WorkspaceProvider(props: { workspaceId: Workspace["id"]; children: React.ReactNode }) {
  const store = useApiClientStore(props.workspaceId);

  return (
    <Provider context={WorkspaceStoreContext} store={store}>
      {props.children}
    </Provider>
  );
}
