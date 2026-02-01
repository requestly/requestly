import { WorkspaceProvider } from "features/apiClient/common/WorkspaceProvider";
import { ExampleCollectionsDaemon } from "features/apiClient/exampleCollections/components/ExampleCollectionsDaemon";
import { AutoSyncLocalStoreDaemon } from "features/apiClient/helpers/modules/sync/localStore/components/AutoSyncLocalStoreDaemon";
import { useGetAllSelectedWorkspaces, useViewMode } from "features/apiClient/slices/workspaceView/hooks";
import { ApiClientViewMode } from "features/apiClient/slices/workspaceView/types";
import React from "react";
import EnvironmentDaemon from "./EnvironmentDaemon";
import CollectionVariablesDaemon from "./CollectionVariablesDaemon";

const Daemon: React.FC = React.memo(() => {
  const selectedWorkspaces = useGetAllSelectedWorkspaces();
  const viewMode = useViewMode();
  const isSingle = viewMode === ApiClientViewMode.SINGLE;

  // Filter out workspaces that are still loading - their context doesn't exist in registry yet
  // Context is only added to registry after createContext completes (async)
  // But workspace is added to Redux state immediately in addWorkspaceIntoView.pending (sync)
  const readyWorkspaces = selectedWorkspaces.filter((workspace) => !workspace.status.loading);

  const daemons = readyWorkspaces.map((workspace) => (
    <WorkspaceProvider workspaceId={workspace.id} key={workspace.id}>
      {isSingle ? (
        <>
          <AutoSyncLocalStoreDaemon />
          <ExampleCollectionsDaemon />
          <EnvironmentDaemon />
          <CollectionVariablesDaemon />
        </>
      ) : null}
    </WorkspaceProvider>
  ));

  return daemons;
});

export default Daemon;
