import {
  ApiClientFeatureContext,
  apiClientFeatureContextProviderStore,
} from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "../types";

export function getStores(ctx: ApiClientFeatureContext) {
  return ctx.stores;
}

export function getApiClientRecordsStore(ctx: ApiClientFeatureContext) {
  return getStores(ctx).records;
}

export function getApiClientEnvironmentsStore(ctx: ApiClientFeatureContext) {
  return getStores(ctx).environments;
}

export function getApiClientRecordStore(ctx: ApiClientFeatureContext, id: string) {
  return getApiClientRecordsStore(ctx).getState().getRecordStore(id);
}

export function getApiClientEnvironmentVariablesStore(ctx: ApiClientFeatureContext, id: string) {
  return getApiClientEnvironmentsStore(ctx).getState().getEnvironment(id)?.data.variables;
}

export function getApiClientCollectionVariablesStore(ctx: ApiClientFeatureContext, id: string) {
  const recordState = getApiClientRecordStore(ctx, id)?.getState();
  if (!recordState || recordState.type !== RQAPI.RecordType.COLLECTION) {
    return;
  }
  return recordState.collectionVariables;
}

// Multiview
export function getApiClientFeatureContext(contextId: string) {
  return apiClientFeatureContextProviderStore.getState().getContext(contextId);
}

export function getChildParentMap(context: ApiClientFeatureContext) {
  return context.stores.records.getState().childParentMap;
}

export function saveOrUpdateRecord(context: ApiClientFeatureContext, apiClientRecord: RQAPI.ApiClientRecord) {
  const recordId = apiClientRecord.id;
  const apiRecordsStore = context.stores.records;
  const doesRecordExist = !!apiRecordsStore.getState().getData(recordId);

  if (doesRecordExist) {
    apiRecordsStore.getState().updateRecord(apiClientRecord);
  } else {
    apiRecordsStore.getState().addNewRecord(apiClientRecord);
  }
}

export function saveBulkRecords(context: ApiClientFeatureContext, records: RQAPI.ApiClientRecord[]) {
  const apiRecordsStore = context.stores.records;
  apiRecordsStore.getState().updateRecords(records);
}
