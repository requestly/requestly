import { ExampleCollectionsDaemon } from "features/apiClient/exampleCollections/components/ExampleCollectionsDaemon";
import { AutoSyncLocalStoreDaemon } from "features/apiClient/helpers/modules/sync/localStore/components/AutoSyncLocalStoreDaemon";
import React from "react";
import { useAPIRecordsStore } from "../ApiRecordsContextProvider";
import EnvironmentDaemon from "./EnvironmentDaemon";
import CollectionVariablesDaemon from "./CollectionVariablesDaemon";

const Daemon: React.FC = () => {
  const recordsStore = useAPIRecordsStore();

  return (
    <>
      <EnvironmentDaemon />
      <CollectionVariablesDaemon />
      <ExampleCollectionsDaemon store={recordsStore} />
      <AutoSyncLocalStoreDaemon />
    </>
  );
};

export default Daemon;
