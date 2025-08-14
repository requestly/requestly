import { filterOutChildrenRecords, processRecordsForDuplication } from "features/apiClient/screens/apiClient/utils";
import {
  getApiClientFeatureContextProviderStore,
  getApiClientRecordsStore,
  getChildParentMapByContextId,
} from "../store.utils";
import { NativeError } from "errors/NativeError";
import { getRecordsToRender } from "../utils";
import { forceRefreshRecords } from "../records";

export const bulkDuplicateRecords = async (contextId: string, recordIds: Set<string>) => {
  const context = getApiClientFeatureContextProviderStore(contextId);

  if (!context) {
    throw new NativeError("Context not found to duplicate records").addContext({ contextId });
  }

  const apiClientRecords = getApiClientRecordsStore(context).getState().apiClientRecords;
  const apiClientRecordsRepository = context.repositories.apiClientRecordsRepository;

  const recordsToRender = getRecordsToRender({ apiClientRecords });
  const childParentMap = getChildParentMapByContextId(contextId);
  const processedRecords = filterOutChildrenRecords(recordIds, childParentMap, recordsToRender.recordsMap);
  const recordsToDuplicate = processRecordsForDuplication(processedRecords, apiClientRecordsRepository);

  const result = await apiClientRecordsRepository.duplicateApiEntities(recordsToDuplicate);

  await forceRefreshRecords(context);

  return result; // TODO: handle UI after duplicate eg expanding collections
};
