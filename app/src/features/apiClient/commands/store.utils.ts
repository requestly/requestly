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
export function getApiClientFeatureContextProviderStore(contextId: string) {
  return apiClientFeatureContextProviderStore.getState().getContext(contextId);
}

export function getChildParentMapByContextId(contextId: string) {
  const context = getApiClientFeatureContextProviderStore(contextId);
  return context.stores.records.getState().childParentMap;
}
