import {
  ApiClientFeatureContext,
  apiClientFeatureContextProviderStore,
  NoopContext,
  NoopContextId,
} from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "../types";
import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
} from "../store/multiWorkspaceView/multiWorkspaceView.store";

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

export function getOrderedApiClientRecords(
  ctx: ApiClientFeatureContext,
  runOrder: RQAPI.RunOrder
): RQAPI.OrderedRequests {
  const getApiRecord = ctx.stores.records.getState().getData;

  return runOrder
    .map((o) => {
      const record = getApiRecord(o.id);
      return record ? { record, isSelected: o.isSelected } : null;
    })
    .filter((r): r is { record: RQAPI.ApiRecord; isSelected: boolean } => !!r);
}

// Multiview
export function getApiClientFeatureContext(contextId?: string): ApiClientFeatureContext {
  const { getSingleViewContext, getContext, getLastUsedContext } = apiClientFeatureContextProviderStore.getState();
  const throwIfUndefined = (context: ApiClientFeatureContext | undefined) => {
    if (!context) {
      throw new Error("No context found in getApiClientFeatureContext");
    }
    return context;
  };

  if (contextId === NoopContextId) {
    return NoopContext;
  }
  const { viewMode } = apiClientMultiWorkspaceViewStore.getState();
  if (viewMode === ApiClientViewMode.SINGLE) {
    return getSingleViewContext();
  }

  if (!contextId) {
    return throwIfUndefined(getLastUsedContext());
  }

  return throwIfUndefined(getContext(contextId));
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
