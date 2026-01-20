import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { partition } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { getAllRecords } from "../utils";
import { isApiRequest } from "features/apiClient/screens/apiClient/utils";

export async function deleteRecords(context: ApiClientFeatureContext, params: { records: RQAPI.ApiClientRecord[] }) {
  const { records } = params;
  const { apiClientRecordsRepository } = context.repositories;
  const apiRecordsStore = context.stores.records;

  const recordsToBeDeleted = getAllRecords(records);

  const [apiRecords, collectionRecords] = partition(recordsToBeDeleted, isApiRequest);
  const apiRecordIds = apiRecords.map((record) => record.id);
  const collectionRecordIds = collectionRecords.map((record) => record.id);

  const recordsDeletionResult = await apiClientRecordsRepository.deleteRecords(apiRecordIds);
  const collectionsDeletionResult = await apiClientRecordsRepository.deleteCollections(collectionRecordIds);

  if (recordsDeletionResult.success && collectionsDeletionResult.success) {
    apiRecordsStore.getState().deleteRecords([...apiRecordIds, ...collectionRecordIds]);
  }

  return {
    recordsDeletionResult,
    collectionsDeletionResult,
    deletedApiRecords: apiRecords,
    deletedCollectionRecords: collectionRecords,
  };
}
