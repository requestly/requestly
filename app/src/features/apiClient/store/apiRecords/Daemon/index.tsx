import { WorkspaceProvider } from "features/apiClient/common/WorkspaceProvider";
import { ExampleCollectionsDaemon } from "features/apiClient/exampleCollections/components/ExampleCollectionsDaemon";
import { AutoSyncLocalStoreDaemon } from "features/apiClient/helpers/modules/sync/localStore/components/AutoSyncLocalStoreDaemon";
import { apiClientContextRegistry } from "features/apiClient/slices";
import React from "react";

const Daemon: React.FC = React.memo(() => {
  const contexts = apiClientContextRegistry.getAllContexts();
  const isMulti = contexts.length > 1;

  const daemons = contexts.map(({ workspaceId: contextId }) => (
    <WorkspaceProvider workspaceId={contextId}>
      {!isMulti ? (
        <>
          <AutoSyncLocalStoreDaemon />
          <ExampleCollectionsDaemon />
          {/*<EnvironmentDaemon />*/}
          {/*<CollectionVariablesDaemon />*/}
        </>
      ) : null}
    </WorkspaceProvider>
  ));

  return daemons;
});

export default Daemon;
