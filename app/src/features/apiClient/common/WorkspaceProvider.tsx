import React, { createContext, useContext } from "react";
import {
  createDispatchHook,
  createSelectorHook,
  createStoreHook,
  Provider,
  ReactReduxContextValue,
  TypedUseSelectorHook,
} from "react-redux";
import { ApiClientStore, ApiClientStoreState, useApiClientStore } from "../slices";
import { Workspace } from "features/workspaces/types";
import { NoopContextId } from "../commands/utils";
import { apiClientContextRegistry } from "../slices/workspaceView/helpers/ApiClientContextRegistry/ApiClientContextRegistry";

export const WorkspaceStoreContext = createContext<ReactReduxContextValue<ApiClientStoreState> | null>(null);

export const useWorkspaceViewStore = createStoreHook(WorkspaceStoreContext);
export const useWorkspaceViewDispatch = createDispatchHook(WorkspaceStoreContext);

export const useWorkspaceViewSelector: TypedUseSelectorHook<ApiClientStoreState> = createSelectorHook(
  WorkspaceStoreContext
);

const WorkspaceIdContext = createContext<Workspace["id"] | undefined>(undefined);

export const WorkspaceIdContextProvider: React.FC<React.PropsWithChildren<{ id: Workspace["id"] }>> = ({
  id,
  children,
}) => {
  return <WorkspaceIdContext.Provider value={id}>{children}</WorkspaceIdContext.Provider>;
};

export function useWorkspaceId() {
  return useContext(WorkspaceIdContext);
}

// Inner component that accesses the store — only rendered when context exists in registry.
const WorkspaceStoreProviderInner: React.FC<React.PropsWithChildren> = (props) => {
  const store = useApiClientStore();

  return (
    <Provider context={WorkspaceStoreContext} store={store}>
      {props.children}
    </Provider>
  );
};

// Outer guard following the same pattern as Daemon and MultiWorkspaceSidebar wrapper:
// check that the workspace context exists in the registry before rendering children
// that access it. During workspace transitions (between clearAll and createContext),
// context is absent — return null and let the parent re-render once context is ready.
const WorkspaceStoreProvider: React.FC<React.PropsWithChildren> = (props) => {
  const workspaceId = useWorkspaceId();

  if (workspaceId === undefined || !apiClientContextRegistry.hasContext(workspaceId)) {
    return null;
  }

  return <WorkspaceStoreProviderInner>{props.children}</WorkspaceStoreProviderInner>;
};

export const FakeWorkspaceStoreProvider: React.FC<React.PropsWithChildren & { store: ApiClientStore }> = (props) => {
  return (
    <WorkspaceIdContextProvider id={NoopContextId}>
      <Provider context={WorkspaceStoreContext} store={props.store}>
        {props.children}
      </Provider>
    </WorkspaceIdContextProvider>
  );
};

export const WorkspaceProvider: React.FC<React.PropsWithChildren<{ workspaceId: Workspace["id"] }>> = (props) => {
  return (
    <WorkspaceIdContextProvider id={props.workspaceId}>
      <WorkspaceStoreProvider>{props.children}</WorkspaceStoreProvider>
    </WorkspaceIdContextProvider>
  );
};
