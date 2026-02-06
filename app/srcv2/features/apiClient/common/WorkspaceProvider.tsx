import React, { createContext, useContext } from "react";
import type { ReactReduxContextValue, TypedUseSelectorHook } from "react-redux";
import { createDispatchHook, createSelectorHook, createStoreHook, Provider } from "react-redux";
import type { ApiClientStore } from "@adapters/workspace";
import type { Workspace } from "@adapters/workspace";
import type { ApiClientStoreState } from "@adapters/workspace";
import { useApiClientStore } from "@adapters/workspace";

export const NoopContextId = "__stub_context_id";

export const WorkspaceStoreContext = createContext<ReactReduxContextValue<ApiClientStoreState> | null>(null);

export const useWorkspaceViewStore = createStoreHook(
  WorkspaceStoreContext as React.Context<ReactReduxContextValue<ApiClientStoreState>>
);
export const useWorkspaceViewDispatch = createDispatchHook(
  WorkspaceStoreContext as React.Context<ReactReduxContextValue<ApiClientStoreState>>
);

export const useWorkspaceViewSelector: TypedUseSelectorHook<ApiClientStoreState> = createSelectorHook(
  WorkspaceStoreContext as React.Context<ReactReduxContextValue<ApiClientStoreState>>
);

const WorkspaceIdContext = createContext<Workspace["id"] | undefined>(undefined);

export const WorkspaceIdContextProvider: React.FC<React.PropsWithChildren<{ id: Workspace["id"] }>> = ({
  id,
  children,
}) => {
  return <WorkspaceIdContext.Provider value={id}>{children}</WorkspaceIdContext.Provider>;
};

export function useWorkspaceId(): Workspace["id"] {
  return useContext(WorkspaceIdContext);
}

const WorkspaceStoreProvider: React.FC<React.PropsWithChildren> = (props) => {
  const store = useApiClientStore();

  return (
    <Provider
      context={WorkspaceStoreContext as React.Context<ReactReduxContextValue<ApiClientStoreState>>}
      store={store}
    >
      {props.children}
    </Provider>
  );
};

export const FakeWorkspaceStoreProvider: React.FC<React.PropsWithChildren & { store: ApiClientStore }> = (props) => {
  return (
    <WorkspaceIdContextProvider id={NoopContextId}>
      <Provider
        context={WorkspaceStoreContext as React.Context<ReactReduxContextValue<ApiClientStoreState>>}
        store={props.store}
      >
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
