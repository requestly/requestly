import React, { createContext, useContext } from "react";
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
import { NativeError } from "errors/NativeError";

const WorkspaceStoreContext = createContext<ReactReduxContextValue<ApiClientStoreState> | null>(null);

export const useWorkspaceViewStore = createStoreHook(WorkspaceStoreContext);
export const useWorkspaceViewDispatch = createDispatchHook(WorkspaceStoreContext);

export const useWorkspaceViewSelector: TypedUseSelectorHook<ApiClientStoreState> = createSelectorHook(
  WorkspaceStoreContext
);

const WorkspaceIdContext = createContext<Workspace["id"] | undefined>(undefined);

export function useWorkspaceId() {
  const ctx = useContext(WorkspaceIdContext);

  if (ctx === undefined) {
    throw new NativeError("Context not found, use `useWorkspaceIdContext` inside a `WorkspaceIdContext.Provider`");
  }

  return ctx;
}

const WorkspaceStoreProvider: React.FC<React.PropsWithChildren> = (props) => {
  const store = useApiClientStore();

  return (
    <Provider context={WorkspaceStoreContext} store={store}>
      {props.children}
    </Provider>
  );
};

export function WorkspaceProvider(props: { workspaceId: Workspace["id"]; children: React.ReactNode }) {
  return (
    <WorkspaceIdContext.Provider value={props.workspaceId}>
      <WorkspaceStoreProvider>{props.children}</WorkspaceStoreProvider>
    </WorkspaceIdContext.Provider>
  );
}
