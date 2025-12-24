import type { EntityState, Middleware } from "@reduxjs/toolkit";
import { tabsActions } from "./slice";
import { bufferActions } from "features/apiClient/slices/buffer/slice";
import { apiRecordsAdapter } from "features/apiClient/slices/apiRecords/slice";
import { environmentsAdapter } from "features/apiClient/slices/environments/slice";
import type { ApiClientStoreState } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import type { TabSource } from "componentsV2/Tabs/types";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";
import { RequestViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import type { RootState } from "store/types";
import { EnvironmentEntity, getApiClientFeatureContext } from "features/apiClient/slices";
import { TabState } from "./types";
import { reduxStore } from "store";
import { openBufferedTab } from "./actions";

export interface GetEntityDataFromTabSourceState {
  records: {
    records: EntityState<RQAPI.ApiClientRecord>;
  };
  environments: {
    environments: EntityState<EnvironmentEntity>;
    globalEnvironment: EnvironmentEntity;
  };
}

export function getEntityDataFromTabSource(
  source: TabSource,
  state: GetEntityDataFromTabSourceState
): { entityType: ApiClientEntityType; entityId?: string; data: unknown } {
  const sourceId = source.getSourceId();
  const sourceType = source.type;

  const isDraftRequest = source instanceof DraftRequestContainerTabSource;
  const isRequest = source instanceof RequestViewTabSource;
  const isCollection = source instanceof CollectionViewTabSource;
  const isEnvironment = source instanceof EnvironmentViewTabSource;

  if (isDraftRequest) {
    return {
      entityType:
        source.metadata.apiEntryType === RQAPI.ApiEntryType.HTTP
          ? ApiClientEntityType.HTTP_RECORD
          : ApiClientEntityType.GRAPHQL_RECORD,
      data: source.metadata.emptyRecord,
    };
  }

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

function getApiClientStoreByTabSource(source: TabState["source"]) {
  const workspaceId = source.metadata.context?.id;
  const context = getApiClientFeatureContext(workspaceId);
  return context.store;
}

export const tabBufferMiddleware: Middleware = (params: { getState: () => RootState }) => (next) => (action) => {
  if (openBufferedTab.match(action)) {
    const { source, isNew = false, preview } = action.payload;

    const apiClientStore = getApiClientStoreByTabSource(source);
    const state = apiClientStore.getState() as ApiClientStoreState;
    const entityData = getEntityDataFromTabSource(source, { records: state.records, environments: state.environments });
    const { entityType, entityId, data } = entityData;

    const payloadAction = apiClientStore.dispatch(
      bufferActions.open({
        isNew,
        entityType: entityType,
        referenceId: entityId,
        data: data,
      })
    );

    reduxStore.dispatch(
      tabsActions.openTab({
        source,
        modeConfig: {
          mode: "buffer",
          entityId: payloadAction.meta.id,
        },
        preview,
      })
    );
  }

  return next(action);
};
