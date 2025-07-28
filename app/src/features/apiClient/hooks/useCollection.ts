import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";
import { useCallback } from "react";
import { useApiClientRepository } from "../helpers/modules/sync/useApiClientSyncRepo";
import { useAPIRecords } from "../store/apiRecords/ApiRecordsContextProvider";
import { useApiClientContext } from "../contexts";
import { RQAPI } from "../types";
import { notification } from "antd";

export const useCollection = () => {
  const syncRepository = useApiClientRepository();
  const [getData, getRecordStore] = useAPIRecords((s) => [s.getData, s.getRecordStore]);
  const { onSaveRecord } = useApiClientContext();

  const getCollectionVariables = useCallback(
    (collectionId: string): EnvironmentVariables => {
      const collectionStore = getRecordStore(collectionId);

      if (!collectionStore) {
        throw new Error("Collection not found!");
      }

      return Object.fromEntries(collectionStore.getState().collectionVariables.getState().getAll());
    },
    [getRecordStore]
  );

  const setCollectionVariables = useCallback(
    async (variables: EnvironmentVariables, collectionId: string) => {
      let collection: RQAPI.CollectionRecord;
      try {
        const existingRecord = getData(collectionId);
        if (!existingRecord) {
          throw new Error("Collection not found");
        }

        if (existingRecord.type !== RQAPI.RecordType.COLLECTION) {
          throw new Error("Record is not a collection");
        }
        collection = existingRecord as RQAPI.CollectionRecord;
      } catch (error) {
        throw new Error("Collection not found");
      }

      const updatedVariables = Object.fromEntries(
        Object.entries(variables).map(([key, value]) => {
          const typeToSave =
            value.type === EnvironmentVariableType.Secret
              ? EnvironmentVariableType.Secret
              : (typeof value.syncValue as EnvironmentVariableType);
          const { localValue, ...rest } = value;
          return [key, { ...rest, type: typeToSave }];
        })
      );
      const record: RQAPI.CollectionRecord = {
        ...collection,
        data: { ...collection?.data, variables: updatedVariables },
      };
      return syncRepository.apiClientRecordsRepository
        .setCollectionVariables(record.id, record.data.variables)
        .then((result) => {
          onSaveRecord(result.data as RQAPI.Record, "open");
          getRecordStore(collectionId)?.getState().collectionVariables.getState().mergeAndUpdate(variables);
        })
        .catch(() => {
          notification.error({
            message: "Error while updating collection variables",
            placement: "bottomRight",
          });
        });
    },
    [onSaveRecord, getRecordStore, syncRepository.apiClientRecordsRepository, getData]
  );

  return {
    getCollectionVariables,
    setCollectionVariables,
  };
};
