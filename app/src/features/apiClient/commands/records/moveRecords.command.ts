import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { RQAPI } from "features/apiClient/types";
import { omit } from "lodash";
import { saveBulkRecords, saveOrUpdateRecord } from "../store.utils";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export async function moveRecords(
  context: ApiClientFeatureContext,
  params: {
    collectionId: string;
    recordsToMove: RQAPI.ApiClientRecord[];
  }
) {
  const { collectionId, recordsToMove } = params;
  const { apiClientRecordsRepository } = context.repositories;

  const updatedRequests = recordsToMove.map((record) => {
    return isApiCollection(record)
      ? { ...record, collectionId, data: omit(record.data, "children") }
      : { ...record, collectionId };
  });

  const result = await apiClientRecordsRepository.moveAPIEntities(updatedRequests, collectionId);

  if (result.length === 1) {
    saveOrUpdateRecord(context, result[0]);
  } else {
    saveBulkRecords(context, result);
  }


  return result;
}
