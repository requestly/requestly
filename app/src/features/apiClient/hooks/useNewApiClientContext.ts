import { useCallback } from "react";
import { useAPIRecords } from "../store/apiRecords/ApiRecordsContextProvider";
import { RQAPI } from "../types";
import { RequestViewTabSource } from "../screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "../screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { useApiClientFeatureContext } from "../slices";
import { saveOrUpdateRecord } from "../commands/store.utils";
import { useTabActions } from "componentsV2/Tabs/slice";

export function useNewApiClientContext() {
  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();
  // const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  // const [addNewRecord, updateRecord, updateRecords, addNewRecords, getData] = useAPIRecords((state) => [
  //   state.addNewRecord,
  //   state.updateRecord,
  //   state.updateRecords,
  //   state.addNewRecords,
  //   state.getData,
  // ]);

  const onSaveBulkRecords = useCallback(
    (records: RQAPI.ApiClientRecord[]) => {
      const existingRecords: RQAPI.ApiClientRecord[] = [];
      const newRecords: RQAPI.ApiClientRecord[] = [];

      // records.forEach((record) => {
      //   const doesRecordExist = !!getData(record.id);
      //   if (doesRecordExist) {
      //     existingRecords.push(record);
      //   } else {
      //     newRecords.push(record);
      //   }
      // });

      // if (existingRecords.length > 0) {
      //   updateRecords(existingRecords);
      // }

      // if (newRecords.length > 0) {
      //   // addNewRecords(newRecords);
      // }
    },
    [
      // updateRecords, addNewRecords, getData
    ]
  );

  const onSaveRecord: (apiClientRecord: RQAPI.ApiClientRecord, onSaveTabAction?: "open") => void = useCallback(
    (apiClientRecord, onSaveTabAction) => {
      const recordId = apiClientRecord.id;
      saveOrUpdateRecord(context, apiClientRecord);

      if (onSaveTabAction === "open") {
        if (apiClientRecord.type === RQAPI.RecordType.API) {
          openBufferedTab({
            // isNew: !doesRecordExist,
            source: new RequestViewTabSource({
              id: recordId,
              apiEntryDetails: apiClientRecord,
              title: apiClientRecord.name,

              context: {
                id: context.workspaceId,
              },
            }),
          });
          return;
        }
        if (apiClientRecord.type === RQAPI.RecordType.COLLECTION) {
          openBufferedTab({
            // isNewTab: !doesRecordExist,
            source: new CollectionViewTabSource({
              id: recordId,
              title: apiClientRecord.name,
              context: {
                id: context.workspaceId,
              },
            }),
          });
          return;
        }
      }
    },
    [context, openBufferedTab]
  );

  return {
    onSaveRecord,
    onSaveBulkRecords,
  };
}
