import type { EntityState, ListenerErrorHandler } from "@reduxjs/toolkit";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";
import { tabsActions } from "./slice";
import { bufferActions, findBufferByReferenceId } from "features/apiClient/slices/buffer/slice";
import { apiRecordsAdapter } from "features/apiClient/slices/apiRecords/slice";
import { environmentsAdapter } from "features/apiClient/slices/environments/slice";
import type { ApiClientStoreState } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import type { TabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";
import { isHttpApiRecord } from "features/apiClient/screens/apiClient/utils";
import { RequestViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import { RuntimeVariablesViewTabSource } from "features/apiClient/screens/environment/components/RuntimeVariables/runtimevariablesTabSource";
import { EntityNotFound, EnvironmentEntity, getApiClientFeatureContext } from "features/apiClient/slices";
import { selectRuntimeVariablesEntity } from "features/apiClient/slices/runtimeVariables/selectors";
import { TabState } from "./types";
import { reduxStore } from "store";
import { openBufferedTab } from "./actions";
import { closeTab, closeAllTabs } from "./thunks";
import { HistoryViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/request/HistoryView/historyViewTabSource";
import { ExampleViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/ExampleRequestView/exampleViewTabSource";

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
  const isExample = source instanceof ExampleViewTabSource;
  const isCollection = source instanceof CollectionViewTabSource;
  const isEnvironment = source instanceof EnvironmentViewTabSource;
  const isRuntimeVariables = source instanceof RuntimeVariablesViewTabSource;
  const isHistory = source instanceof HistoryViewTabSource;

  if (isDraftRequest) {
    const draftSource = source as DraftRequestContainerTabSource;
    return {
      entityType:
        draftSource.metadata.apiEntryType === RQAPI.ApiEntryType.HTTP
          ? ApiClientEntityType.HTTP_RECORD
          : ApiClientEntityType.GRAPHQL_RECORD,
      data: draftSource.metadata.emptyRecord,
    };
  }

  if (isHistory) {
    const historySource = source as HistoryViewTabSource;
    const historyMetadata = historySource.metadata as {
      record?: RQAPI.ApiRecord;
      entryType?: RQAPI.ApiEntryType;
    } & TabSourceMetadata;

    const record = historyMetadata.record;
    if (!record) {
      throw new NativeError("[Tab Buffer Middleware] HistoryViewTabSource missing record");
    }

    const isHttp = isHttpApiRecord(record);
    const entryType = record.data?.type ?? (isHttp ? RQAPI.ApiEntryType.HTTP : RQAPI.ApiEntryType.GRAPHQL);
    const entityType = isHttp ? ApiClientEntityType.HTTP_RECORD : ApiClientEntityType.GRAPHQL_RECORD;
    const workspaceId = historySource.metadata.context?.id;
    const entityId = `history:${workspaceId}:${entryType}`;

    return {
      entityType,
      entityId,
      data: record,
    };
  }

  if (isExample) {
    const record = apiRecordsAdapter.getSelectors().selectById(state.records.records, sourceId);

    if (!record || record.type !== RQAPI.RecordType.EXAMPLE_API) {
      throw new EntityNotFound(sourceId, source.type);
    }

    const exampleRecord = record as RQAPI.ExampleApiRecord;

    const entityType =
      exampleRecord.data?.type === RQAPI.ApiEntryType.GRAPHQL
        ? ApiClientEntityType.GRAPHQL_RECORD
        : ApiClientEntityType.HTTP_RECORD;

    return {
      entityType,
      entityId: sourceId,
      data: exampleRecord,
    };
  }

  if (isRequest || isCollection) {
    const apiRecord = apiRecordsAdapter.getSelectors().selectById(state.records.records, sourceId);

    if (!apiRecord) {
      throw new EntityNotFound(sourceId, source.type);
    }

    const entityType =
      apiRecord.type === RQAPI.RecordType.COLLECTION
        ? ApiClientEntityType.COLLECTION_RECORD
        : isHttpApiRecord(apiRecord as RQAPI.ApiRecord)
        ? ApiClientEntityType.HTTP_RECORD
        : ApiClientEntityType.GRAPHQL_RECORD;

    return {
      entityType,
      entityId: sourceId,
      data: apiRecord,
    };
  }

  if (isEnvironment) {
    const isGlobalEnvironment = source.metadata.isGlobal;
    const globalEnv = state.environments.globalEnvironment;

    const environment = isGlobalEnvironment
      ? globalEnv
      : environmentsAdapter.getSelectors().selectById(state.environments.environments, sourceId);

    if (!environment) {
      throw new EntityNotFound(sourceId, source.type);
    }

    return {
      entityType: isGlobalEnvironment ? ApiClientEntityType.GLOBAL_ENVIRONMENT : ApiClientEntityType.ENVIRONMENT,
      entityId: sourceId,
      data: environment,
    };
  }

  if (isRuntimeVariables) {
    // Runtime variables are stored in the global Redux store
    const entity = selectRuntimeVariablesEntity(reduxStore.getState());
    return {
      entityType: ApiClientEntityType.RUNTIME_VARIABLES,
      entityId: sourceId,
      data: entity,
    };
  }

  throw new NativeError(`[Tab Buffer Middleware] Unknown source type ${sourceType}`).addContext({ id: sourceId });
}

function getApiClientStoreByTabSource(source: TabState["source"]) {
  const workspaceId = source.metadata.context?.id;
  const context = getApiClientFeatureContext(workspaceId);
  return context.store;
}

function handleOpenBufferedTab(action: ReturnType<typeof openBufferedTab>) {
  const { source, isNew = false, preview, singleton } = action.payload;
  const apiClientStore = getApiClientStoreByTabSource(source);
  const state = apiClientStore.getState() as ApiClientStoreState;
  const entityData = getEntityDataFromTabSource(source, {
    records: state.records,
    environments: state.environments,
  });
  const { entityType, entityId, data } = entityData;

  const existingBuffer = entityId ? findBufferByReferenceId(state.buffer.entities, entityId) : null;

  let bufferId: string;

  // Singleton with existing buffer: skip open, just revert to new data
  if (singleton && existingBuffer) {
    apiClientStore.dispatch(
      bufferActions.revertChanges({
        referenceId: entityId as string,
        sourceData: data,
      })
    );
    bufferId = existingBuffer.id;
  } else {
    // Regular flow: open buffer (creates new or reuses existing)
    const payloadAction = apiClientStore.dispatch(
      bufferActions.open(
        {
          isNew,
          entityType: entityType,
          referenceId: entityId,
          data: data,
        },
        {
          id: existingBuffer?.id,
        }
      )
    );
    bufferId = payloadAction.meta.id;
  }

  reduxStore.dispatch(
    tabsActions.openTab({
      source,
      modeConfig: {
        mode: "buffer",
        entityId: bufferId,
      },
      preview,
      singleton,
    })
  );
}

function closeBufferByTab(tab: TabState) {
  const apiClientStore = getApiClientStoreByTabSource(tab.source);
  apiClientStore.dispatch(bufferActions.close(tab.modeConfig.entityId));

  tab.secondaryBufferIds.forEach((id) => {
    apiClientStore.dispatch(bufferActions.close(id));
  });
}

function handleCloseTabFulfilled(action: ReturnType<typeof closeTab.fulfilled>) {
  const result = action.payload;
  if (result?.tab && result.tab.modeConfig.mode === "buffer") {
    closeBufferByTab(result.tab);
  }
}

function handleCloseAllTabsFulfilled(action: ReturnType<typeof closeAllTabs.fulfilled>) {
  const result = action.payload;
  if (!result?.tabs) {
    return;
  }

  result.tabs.forEach((tab) => {
    if (tab.modeConfig.mode === "buffer") {
      closeBufferByTab(tab);
    }
  });
}

const onError: ListenerErrorHandler = (error, errorInfo) => {
  Sentry.captureException(error, {
    tags: {
      middleware: "tabBufferMiddleware",
      raisedBy: errorInfo.raisedBy,
    },
  });
};

const tabBufferListenerMiddleware = createListenerMiddleware({ onError });

tabBufferListenerMiddleware.startListening({
  predicate: (action) => {
    return openBufferedTab.match(action) || closeTab.fulfilled.match(action) || closeAllTabs.fulfilled.match(action);
  },
  effect: (action) => {
    if (openBufferedTab.match(action)) {
      handleOpenBufferedTab(action);
    }

    if (closeTab.fulfilled.match(action)) {
      handleCloseTabFulfilled(action);
    }

    if (closeAllTabs.fulfilled.match(action)) {
      handleCloseAllTabsFulfilled(action);
    }
  },
});

export const tabBufferMiddleware = tabBufferListenerMiddleware.middleware;
