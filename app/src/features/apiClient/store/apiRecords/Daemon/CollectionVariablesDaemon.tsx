import { VariableScope } from "backend/environment/types";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import React, { useCallback, useEffect } from "react";
import { useAPIRecords } from "../ApiRecordsContextProvider";
import { CollectionVariableMap, RQAPI } from "features/apiClient/types";
import { ApiRecordsState } from "../apiRecords.store";

function getCollectionVariableStoreSelector(state: ApiRecordsState) {
  return function (id: string) {
    const recordState = state.indexStore.get(id)?.getState();
    if (!recordState || recordState.type !== RQAPI.RecordType.COLLECTION) return null;
    const collectionVariableStore = recordState.collectionVariables;
    return collectionVariableStore;
  };
}

const CollectionVariablesDaemon: React.FC = () => {
  const getCollectionVariableStore = useAPIRecords(getCollectionVariableStoreSelector);

  const updateCollections = useCallback(
    (newCollectionVariables: CollectionVariableMap) => {
      for (const [recordId, newData] of Object.entries(newCollectionVariables)) {
        const varStore = getCollectionVariableStore(recordId);
        if (varStore) {
          varStore.getState().mergeAndUpdate(newData.variables);
        }
      }
    },
    [getCollectionVariableStore]
  );

  const { environmentVariablesRepository } = useApiClientRepository();

  useEffect(() => {
    const unsubscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.COLLECTION,
      callback: (newCollectionVariables) => {
        updateCollections(newCollectionVariables);
      },
    });

    return unsubscribe;
  }, [environmentVariablesRepository, updateCollections]);

  return null;
};

export default CollectionVariablesDaemon;
