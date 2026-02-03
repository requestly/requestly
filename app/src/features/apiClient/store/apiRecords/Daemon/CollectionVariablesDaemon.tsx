import { VariableScope } from "backend/environment/types";
import React, { useEffect } from "react";
import { useApiClientRepository, useApiClientStore } from "features/apiClient/slices";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { apiRecordsActions, selectRecordById } from "features/apiClient/slices/apiRecords";
import { RQAPI } from "features/apiClient/types";
import { mergeSyncedVariablesPreservingLocalValue } from "features/apiClient/slices/utils/syncVariables";

const CollectionVariablesDaemon: React.FC = () => {
  const { environmentVariablesRepository } = useApiClientRepository();
  const dispatch = useApiClientDispatch();
  const store = useApiClientStore();

  useEffect(() => {
    const unsubscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.COLLECTION,
      callback: (newCollectionVariables) => {
        for (const collectionId in newCollectionVariables) {
          const record = selectRecordById(store.getState() as any, collectionId);
          if (!record || record.type !== RQAPI.RecordType.COLLECTION) {
            // Repository can emit variables for collections not present in current store
            // (deleted, not yet hydrated, or out-of-sync). Skip instead of throwing.
            continue;
          }
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
  }, [environmentVariablesRepository, dispatch, store]);

  return null;
};

export default CollectionVariablesDaemon;
