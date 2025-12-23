import type { Middleware } from "@reduxjs/toolkit";
import { tabsActions } from "./slice";
import { bufferActions } from "features/apiClient/slices/buffer/slice";
import { apiRecordsAdapter } from "features/apiClient/slices/apiRecords/slice";
import { environmentsAdapter } from "features/apiClient/slices/environments/slice";
import type { ApiClientStoreState } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import type { TabSource } from "componentsV2/Tabs/types";
import { RQAPI } from "features/apiClient/types";
import { getApiClientFeatureContext } from "features/apiClient/slices";
import { NativeError } from "errors/NativeError";
import { RequestViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";

function getEntityDataFromTabSource(
  source: TabSource,
  state: ApiClientStoreState
): { entityType: ApiClientEntityType; entityId: string; data: unknown } {
  const sourceId = source.getSourceId();
  const sourceType = source.type;

  const isRequest = sourceType === RequestViewTabSource.name || sourceType === DraftRequestContainerTabSource.name;
  const isCollection = sourceType === CollectionViewTabSource.name;
  const isEnvironment = sourceType === EnvironmentViewTabSource.name;

  if (isRequest || isCollection) {
    const apiRecord = apiRecordsAdapter.getSelectors().selectById(state.records.records, sourceId);

    if (!apiRecord) {
      throw new NativeError(`[Tab Buffer Middleware] Cannot find request`).addContext({ id: sourceId });
    }

    const entityType =
      apiRecord.type === RQAPI.RecordType.COLLECTION
        ? ApiClientEntityType.COLLECTION_RECORD
        : apiRecord.data.type === RQAPI.ApiEntryType.HTTP
        ? ApiClientEntityType.HTTP_RECORD
        : ApiClientEntityType.GRAPHQL_RECORD;

    return {
      entityType,
      entityId: sourceId,
      data: apiRecord,
    };
  }

  if (isEnvironment) {
    const environment = environmentsAdapter.getSelectors().selectById(state.environments.environments, sourceId);

    if (!environment) {
      throw new NativeError(`[Tab Buffer Middleware] Cannot find environment`).addContext({ id: sourceId });
    }

    return {
      entityType: ApiClientEntityType.ENVIRONMENT,
      entityId: sourceId,
      data: environment,
    };
  }

  throw new NativeError(`[Tab Buffer Middleware] Unknown source type ${sourceType}`).addContext({ id: sourceId });
}

export const tabBufferMiddleware: Middleware = () => (next) => (action) => {
  if (!tabsActions.openTab.match(action)) {
    return next(action);
  }

  const { source, modeConfig } = action.payload;

  if (modeConfig.mode !== "buffer") {
    return next(action);
  }

  const workspaceId = source.metadata.context.id;
  const { store } = getApiClientFeatureContext(workspaceId);
  const state = store.getState();

  const entityData = getEntityDataFromTabSource(source, state);

  const { entityType, entityId, data } = entityData;

  store.dispatch(
    bufferActions.open({
      entityType: entityType,
      isNew: false,
      referenceId: entityId,
      data: data,
    })
  );

  return next(action);
};
