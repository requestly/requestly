import { VariableScope } from "backend/environment/types";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import React, { useCallback, useEffect } from "react";
import { useAPIRecords } from "../ApiRecordsContextProvider";
import { CollectionVariableMap, RQAPI } from "features/apiClient/types";

const CollectionVariablesDaemon: React.FC = () => {
  const indexStore = useAPIRecords((state) => state.indexStore);

  const getCollectionVariableStore = useCallback(
    (id: string) => {
      const recordState = indexStore.get(id)?.getState();
      if (!recordState || recordState.type !== RQAPI.RecordType.COLLECTION) return null;

      return recordState.collectionVariables;
    },
    [indexStore]
  );

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
