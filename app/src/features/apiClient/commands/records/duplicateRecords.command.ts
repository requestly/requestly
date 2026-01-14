import { filterOutChildrenRecords, processRecordsForDuplication } from "features/apiClient/screens/apiClient/utils";
import { getApiClientRecordsStore, getChildParentMap } from "../store.utils";
import { getRecordsToRender } from "../utils";
import { forceRefreshRecords } from "../records";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export async function duplicateRecords(context: ApiClientFeatureContext, params: { recordIds: Set<string> }) {
  const apiClientRecords = getApiClientRecordsStore(context).getState().apiClientRecords;
  const apiClientRecordsRepository = context.repositories.apiClientRecordsRepository;

  const recordsToRender = getRecordsToRender({ apiClientRecords });
  const childParentMap = getChildParentMap(context);
  const processedRecords = filterOutChildrenRecords(params.recordIds, childParentMap, recordsToRender.recordsMap);
  const recordsToDuplicate = processRecordsForDuplication(processedRecords, apiClientRecordsRepository, context);

  const result = await apiClientRecordsRepository.duplicateApiEntities(recordsToDuplicate);

  await forceRefreshRecords(context);

  return result; // TODO: handle UI after duplicate eg expanding collections
}
