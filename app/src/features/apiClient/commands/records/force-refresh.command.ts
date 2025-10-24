import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { closeCorruptedTabs } from "../tabs";

export async function forceRefreshRecords(ctx: ApiClientFeatureContext) {
  const {
    repositories: { apiClientRecordsRepository },
    stores: { records: recordsStore, erroredRecords: erroredRecordsStore },
  } = ctx;
  const recordsToRefresh = await apiClientRecordsRepository.getRecordsForForceRefresh();
  if (!recordsToRefresh || !recordsToRefresh.success) {
    return false;
  }
  recordsStore.getState().refresh(recordsToRefresh.data.records);
  erroredRecordsStore.getState().setApiErroredRecords(recordsToRefresh.data.erroredRecords);
  closeCorruptedTabs();
  return true;

}
