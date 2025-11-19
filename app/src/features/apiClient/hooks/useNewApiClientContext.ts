import { useCallback } from "react";
import { useAPIRecords } from "../store/apiRecords/ApiRecordsContextProvider";
import { RQAPI } from "../types";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { RequestViewTabSource } from "../screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "../screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { useApiClientFeatureContext } from "../contexts/meta";

export function useNewApiClientContext() {
  const context = useApiClientFeatureContext();
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  const [addNewRecord, updateRecord, updateRecords, addNewRecords, getData] = useAPIRecords((state) => [
    state.addNewRecord,
    state.updateRecord,
    state.updateRecords,
    state.addNewRecords,
    state.getData,
  ]);

  const onSaveBulkRecords = useCallback(
    (records: RQAPI.ApiClientRecord[]) => {
      const existingRecords: RQAPI.ApiClientRecord[] = [];
      const newRecords: RQAPI.ApiClientRecord[] = [];

      records.forEach((record) => {
        const doesRecordExist = !!getData(record.id);
        if (doesRecordExist) {
          existingRecords.push(record);
        } else {
          newRecords.push(record);
        }
      });

      if (existingRecords.length > 0) {
        updateRecords(existingRecords);
      }

      if (newRecords.length > 0) {
        addNewRecords(newRecords);
      }
    },
    [updateRecords, addNewRecords, getData]
  );

  const onSaveRecord: (apiClientRecord: RQAPI.ApiClientRecord, onSaveTabAction?: "open") => void = useCallback(
    (apiClientRecord, onSaveTabAction) => {
      const recordId = apiClientRecord.id;

      const doesRecordExist = !!getData(recordId);

      if (doesRecordExist) {
        updateRecord(apiClientRecord);
      } else {
        addNewRecord(apiClientRecord);
      }

      if (onSaveTabAction === "open") {
        if (apiClientRecord.type === RQAPI.RecordType.API) {
          openTab(
            new RequestViewTabSource({
              id: recordId,
              apiEntryDetails: apiClientRecord,
              title: apiClientRecord.name,
              isNewTab: !doesRecordExist,
              context: {
                id: context.id,
              },
            })
          );
          return;
        }

        if (apiClientRecord.type === RQAPI.RecordType.COLLECTION) {
          openTab(
            new CollectionViewTabSource({
              id: recordId,
              title: apiClientRecord.name,
              isNewTab: !doesRecordExist,
              context: {
                id: context.id,
              },
            })
          );
          return;
        }
      }
    },
    [getData, updateRecord, addNewRecord, openTab, context.id]
  );

  return {
    onSaveRecord,
    onSaveBulkRecords,
  };
}
