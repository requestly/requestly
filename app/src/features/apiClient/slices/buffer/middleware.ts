import { createListenerMiddleware } from "@reduxjs/toolkit";
import { bufferActions, findBufferByReferenceId } from "./slice";
import { ApiClientEntityType } from "../entities/types";
import {
  API_CLIENT_RECORDS_SLICE_NAME,
  API_CLIENT_ENVIRONMENTS_SLICE_NAME,
  API_CLIENT_RUNNER_CONFIG_SLICE_NAME,
  BUFFER_SLICE_NAME,
} from "../common/constants";
import { apiRecordsAdapter } from "../apiRecords/slice";
import { environmentsAdapter } from "../environments/slice";
import { runConfigAdapter } from "../runConfig/slice";
import { EntitySyncedPayload } from "../common/actions";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";

type SourceSelectorMap = {
  [K in ApiClientEntityType]?: {
    selectById: (state: ApiClientStoreState, id: string) => unknown | undefined;
  };
};

const BUFFER_SOURCE_SELECTORS: SourceSelectorMap = {
  [ApiClientEntityType.HTTP_RECORD]: {
    selectById: (state, id) => apiRecordsAdapter.getSelectors().selectById(state.records.records, id),
  },
  [ApiClientEntityType.COLLECTION_RECORD]: {
    selectById: (state, id) => apiRecordsAdapter.getSelectors().selectById(state.records.records, id),
  },
  [ApiClientEntityType.GRAPHQL_RECORD]: {
    selectById: (state, id) => apiRecordsAdapter.getSelectors().selectById(state.records.records, id),
  },
  [ApiClientEntityType.ENVIRONMENT]: {
    selectById: (state, id) => environmentsAdapter.getSelectors().selectById(state.environments.environments, id),
  },
  [ApiClientEntityType.GLOBAL_ENVIRONMENT]: {
    selectById: (state) => state.environments.globalEnvironment,
  },
  [ApiClientEntityType.RUN_CONFIG]: {
    selectById: (state, id) => runConfigAdapter.getSelectors().selectById(state.runnerConfig.configs, id),
  },
};

// TODO: Remove this
function extractIdFromPayload(payload: unknown): string | undefined {
  if (typeof payload === "object" && payload !== null) {
    if ("id" in payload && typeof payload.id === "string") {
      return payload.id;
    }
    if ("entityId" in payload && typeof payload.entityId === "string") {
      return payload.entityId;
    }
  }
  return undefined;
}

function syncBufferForId(
  listenerApi: {
    getState: () => unknown;
    dispatch: (action: unknown) => unknown;
  },
  referenceId: string,
  entityType?: ApiClientEntityType
) {
  const currentState = listenerApi.getState() as ApiClientStoreState;
  const bufferState = currentState[BUFFER_SLICE_NAME];
  const buffer = findBufferByReferenceId(bufferState.entities, referenceId);

  if (!buffer) {
    return;
  }

  // If entityType is provided (from entitySynced), use it; otherwise use buffer's entityType
  const targetEntityType = entityType ?? buffer.entityType;
  const sourceSelector = BUFFER_SOURCE_SELECTORS[targetEntityType];

  if (!sourceSelector) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[Buffer Sync] No selector registered for entity type: ${targetEntityType}`);
    }
    return;
  }

  const currentSourceData = sourceSelector.selectById(currentState, referenceId);

  if (currentSourceData !== undefined && buffer.referenceId) {
    listenerApi.dispatch(
      bufferActions.syncFromSource({
        referenceId: buffer.referenceId,
        sourceData: currentSourceData,
      })
    );
  }
}

export const bufferListenerMiddleware = createListenerMiddleware();

bufferListenerMiddleware.startListening({
  predicate: (action) => {
    return (
      action.type.startsWith(`${API_CLIENT_ENVIRONMENTS_SLICE_NAME}/`) ||
      action.type.startsWith(`${API_CLIENT_RECORDS_SLICE_NAME}/`) ||
      action.type.startsWith(`${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/`) ||
      action.type === "entities/synced"
    );
  },

  effect: (action, listenerApi) => {
    // Handle entitySynced action
    if (action.type === "entities/synced") {
      const payload = action.payload as EntitySyncedPayload;
      if (payload.entityId) {
        syncBufferForId(listenerApi, payload.entityId, payload.entityType);
      }
      return;
    }

    // Handle slice actions
    const id = extractIdFromPayload(action.payload);
    if (id) {
      syncBufferForId(listenerApi, id);
    }
  },
});

export const bufferSyncMiddleware = bufferListenerMiddleware.middleware;
