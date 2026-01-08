import { ExampleCollectionsDaemon } from "features/apiClient/exampleCollections/components/ExampleCollectionsDaemon";
import { AutoSyncLocalStoreDaemon } from "features/apiClient/helpers/modules/sync/localStore/components/AutoSyncLocalStoreDaemon";
import React from "react";
import EnvironmentDaemon from "./EnvironmentDaemon";
import CollectionVariablesDaemon from "./CollectionVariablesDaemon";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { apiClientContextRegistry } from "features/apiClient/slices";
import { WorkspaceProvider } from "features/apiClient/common/WorkspaceProvider";

const Daemon: React.FC = React.memo(() => {
  const contexts = apiClientContextRegistry.getAllContexts();
  const isMulti = contexts.length > 1;
          // <ExampleCollectionsDaemon />
      // <EnvironmentDaemon />
      // <CollectionVariablesDaemon />
  const daemons = contexts.map(({ workspaceId: contextId }) => (
    <WorkspaceProvider workspaceId={contextId}>
      {!isMulti ? (
        <>
          <AutoSyncLocalStoreDaemon />
        </>
      ) : null}
    </WorkspaceProvider>
  ));

  return daemons;
});

export default Daemon;
