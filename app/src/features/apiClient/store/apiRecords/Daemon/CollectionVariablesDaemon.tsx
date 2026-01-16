import { VariableScope } from "backend/environment/types";
import React, { useEffect } from "react";
import { useApiClientRepository } from "features/apiClient/slices";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { apiRecordsActions } from "features/apiClient/slices/apiRecords";
import { RQAPI } from "features/apiClient/types";
import { mergeSyncedVariablesPreservingLocalValue } from "features/apiClient/slices/utils/syncVariables";

const CollectionVariablesDaemon: React.FC = () => {
  const { environmentVariablesRepository } = useApiClientRepository();
  const dispatch = useApiClientDispatch();

  useEffect(() => {
    const unsubscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.COLLECTION,
      callback: (newCollectionVariables) => {
        for (const collectionId in newCollectionVariables) {
          const incoming = newCollectionVariables[collectionId]?.variables ?? {};

          dispatch(
            apiRecordsActions.unsafePatch({
              id: collectionId,
              patcher: (record) => {
                if (record.type !== RQAPI.RecordType.COLLECTION) return;

                const current = record.data.variables ?? {};
                const merged = mergeSyncedVariablesPreservingLocalValue(current, incoming);
                record.data.variables = merged;
              },
            })
          );
        }
      },
    });

    return unsubscribe;
  }, [environmentVariablesRepository, dispatch]);

  return null;
};

export default CollectionVariablesDaemon;
