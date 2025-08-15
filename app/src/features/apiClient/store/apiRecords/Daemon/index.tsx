import { ExampleCollectionsDaemon } from "features/apiClient/exampleCollections/components/ExampleCollectionsDaemon";
import { AutoSyncLocalStoreDaemon } from "features/apiClient/helpers/modules/sync/localStore/components/AutoSyncLocalStoreDaemon";
import React from "react";
import EnvironmentDaemon from "./EnvironmentDaemon";
import CollectionVariablesDaemon from "./CollectionVariablesDaemon";
import { useApiClientFeatureContextProvider } from "../../apiClientFeatureContext/apiClientFeatureContext.store";
import { ContextId } from "features/apiClient/contexts/contextId.context";

const Daemon: React.FC = () => {
  const contexts = useApiClientFeatureContextProvider((s) => s.contexts);
  return Array.from(contexts.values()).map(({ id: contextId }) => (
    <ContextId id={contextId}>
      <EnvironmentDaemon />
      <CollectionVariablesDaemon />
      <ExampleCollectionsDaemon />
      <AutoSyncLocalStoreDaemon />
    </ContextId>
  ));
};

export default Daemon;
