import { VariableScope } from "backend/environment/types";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import React, { useEffect } from "react";
import { useAPIRecordsStore } from "../ApiRecordsContextProvider";

const CollectionVariablesDaemon: React.FC = () => {
  const recordsStore = useAPIRecordsStore();
  const { environmentVariablesRepository } = useApiClientRepository();

  useEffect(() => {
    const unsubscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.COLLECTION,
      callback: (newCollectionVariables) => {
        recordsStore.getState().updateCollectionVariables(newCollectionVariables);
      },
    });

    return unsubscribe;
  }, [environmentVariablesRepository, recordsStore]);

  return null;
};

export default CollectionVariablesDaemon;
