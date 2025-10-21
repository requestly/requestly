import { ExampleCollectionsDaemon } from "features/apiClient/exampleCollections/components/ExampleCollectionsDaemon";
import { AutoSyncLocalStoreDaemon } from "features/apiClient/helpers/modules/sync/localStore/components/AutoSyncLocalStoreDaemon";
import React from "react";
import EnvironmentDaemon from "./EnvironmentDaemon";
import CollectionVariablesDaemon from "./CollectionVariablesDaemon";
import { useApiClientFeatureContextProvider } from "../../apiClientFeatureContext/apiClientFeatureContext.store";
import { ContextId } from "features/apiClient/contexts/contextId.context";

const Daemon: React.FC = React.memo(() => {
  const contexts = useApiClientFeatureContextProvider((s) => s.contexts);
  const isMulti = contexts.size > 1;
  const daemons = Array.from(contexts.values()).map(({ id: contextId }) => (
    <ContextId id={contextId}>
      <EnvironmentDaemon />
      <CollectionVariablesDaemon />
      {!isMulti ? (
        <>
          <ExampleCollectionsDaemon />
          <AutoSyncLocalStoreDaemon />
        </>
      ) : null}
    </ContextId>
  ));

  return daemons;
});

export default Daemon;
