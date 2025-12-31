import type { EntityState } from "@reduxjs/toolkit";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import { tabsActions } from "./slice";
import { bufferActions, findBufferByReferenceId } from "features/apiClient/slices/buffer/slice";
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
import { RuntimeVariablesViewTabSource } from "features/apiClient/screens/environment/components/RuntimeVariables/runtimevariablesTabSource";
import { EntityNotFound, EnvironmentEntity, getApiClientFeatureContext } from "features/apiClient/slices";
import { selectRuntimeVariablesEntity } from "features/apiClient/slices/runtimeVariables/selectors";
import { TabState } from "./types";
import { reduxStore } from "store";
import { openBufferedTab } from "./actions";
import { closeTab, closeAllTabs } from "./thunks";

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
  const isRuntimeVariables = source instanceof RuntimeVariablesViewTabSource;

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
      throw new EntityNotFound(sourceId, source.type);
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
  const { source, isNew = false, preview } = action.payload;
  const apiClientStore = getApiClientStoreByTabSource(source);
  const state = apiClientStore.getState() as ApiClientStoreState;
  const entityData = getEntityDataFromTabSource(source, {
    records: state.records,
    environments: state.environments,
  });
  const { entityType, entityId, data } = entityData;

  const existingBuffer = entityId ? findBufferByReferenceId(state.buffer.entities, entityId) : null;

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

function closeBufferByTab(tab: TabState) {
  const apiClientStore = getApiClientStoreByTabSource(tab.source);
  apiClientStore.dispatch(bufferActions.close(tab.modeConfig.entityId));
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

const tabBufferListenerMiddleware = createListenerMiddleware();

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
