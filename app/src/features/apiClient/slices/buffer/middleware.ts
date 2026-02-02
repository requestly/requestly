import {
  createListenerMiddleware,
  AnyAction,
  ListenerEffectAPI,
  Dispatch,
  TypedStartListening,
} from "@reduxjs/toolkit";
import { bufferActions, findBufferByReferenceId } from "./slice";
import { BufferEntry } from "./types";
import { ApiClientEntityType } from "../entities/types";
import {
  API_CLIENT_RECORDS_SLICE_NAME,
  API_CLIENT_ENVIRONMENTS_SLICE_NAME,
  API_CLIENT_RUNNER_CONFIG_SLICE_NAME,
  BUFFER_SLICE_NAME,
  RUNTIME_VARIABLES_ENTITY_ID,
} from "../common/constants";
import { apiRecordsAdapter } from "../apiRecords/slice";
import { environmentsAdapter } from "../environments/slice";
import { runConfigAdapter } from "../runConfig/slice";
import { EntitySyncedPayload } from "../common/actions";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";

type BufferListenerApi = ListenerEffectAPI<ApiClientStoreState, Dispatch<AnyAction>>;

interface BufferSyncRemote {
  entityTypes: ApiClientEntityType[];
  shouldHandleAction: (action: AnyAction) => boolean;
  extractId: (action: AnyAction) => string | undefined;
  selectData: (state: ApiClientStoreState, id: string) => unknown | undefined;
}

const getPayloadId = (action: AnyAction): string | undefined => {
  const p = action.payload as any;
  if (typeof p !== "object" || p === null) return undefined;
  return p.id ?? p.entityId;
};

const recordsRemote: BufferSyncRemote = {
  entityTypes: [
    ApiClientEntityType.HTTP_RECORD,
    ApiClientEntityType.COLLECTION_RECORD,
    ApiClientEntityType.GRAPHQL_RECORD,
  ],
  shouldHandleAction: (action) => action.type.startsWith(`${API_CLIENT_RECORDS_SLICE_NAME}/`),
  extractId: getPayloadId,
  selectData: (state, id) => apiRecordsAdapter.getSelectors().selectById(state.records.records, id),
};

const environmentsRemote: BufferSyncRemote = {
  entityTypes: [ApiClientEntityType.ENVIRONMENT],
  shouldHandleAction: (action) => {
    const isEnvAction = action.type.startsWith(`${API_CLIENT_ENVIRONMENTS_SLICE_NAME}/`);
    const isGlobalAction =
      action.type === `${API_CLIENT_ENVIRONMENTS_SLICE_NAME}/updateGlobalEnvironment` ||
      action.type === `${API_CLIENT_ENVIRONMENTS_SLICE_NAME}/unsafePatchGlobal`;
    return isEnvAction && !isGlobalAction;
  },
  extractId: getPayloadId,
  selectData: (state, id) => environmentsAdapter.getSelectors().selectById(state.environments.environments, id),
};

const globalEnvironmentRemote: BufferSyncRemote = {
  entityTypes: [ApiClientEntityType.GLOBAL_ENVIRONMENT],
  shouldHandleAction: (action) => {
    return (
      action.type === `${API_CLIENT_ENVIRONMENTS_SLICE_NAME}/updateGlobalEnvironment` ||
      action.type === `${API_CLIENT_ENVIRONMENTS_SLICE_NAME}/unsafePatchGlobal`
    );
  },
  // Prefer real id from payload/state (desktop/local uses a path-like id).
  extractId: getPayloadId,
  selectData: (state) => state.environments.globalEnvironment,
};

const runtimeVariablesRemote: BufferSyncRemote = {
  entityTypes: [ApiClientEntityType.RUNTIME_VARIABLES],
  shouldHandleAction: (action) => false,
  extractId: () => RUNTIME_VARIABLES_ENTITY_ID,
  selectData: () => undefined,
};

const runConfigRemote: BufferSyncRemote = {
  entityTypes: [ApiClientEntityType.RUN_CONFIG],
  shouldHandleAction: (action) => action.type.startsWith(`${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/`),
  extractId: getPayloadId,
  selectData: (state, id) => runConfigAdapter.getSelectors().selectById(state.runnerConfig.configs, id),
};

const remotes: BufferSyncRemote[] = [
  recordsRemote,
  globalEnvironmentRemote,
  environmentsRemote,
  runtimeVariablesRemote,
  runConfigRemote,
];

function performBufferSync(
  listenerApi: BufferListenerApi,
  remote: BufferSyncRemote,
  id: string,
  overrideData?: unknown
) {
  const state = listenerApi.getState();
  const bufferState = state[BUFFER_SLICE_NAME];

  const buffer = findBufferByReferenceId(bufferState.entities, id);
  if (!buffer || !buffer.referenceId) return;

  const remoteData = remote.selectData(state, id);
  // When entitySynced sends partial data (e.g. { name } on rename), merge with full remote data
  // so we don't replace buffer.current with a partial object and lose e.g. variables.
  const isSpreadableObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
  const sourceData =
    overrideData !== undefined && isSpreadableObject(remoteData) && isSpreadableObject(overrideData)
      ? { ...remoteData, ...overrideData }
      : overrideData !== undefined
      ? overrideData
      : remoteData;

  if (sourceData !== undefined) {
    listenerApi.dispatch(
      bufferActions.syncFromSource({
        referenceId: buffer.referenceId,
        sourceData: sourceData,
      })
    );
  } else if (process.env.NODE_ENV === "development") {
    console.warn(
      `[BufferSync] Could not find data for ${remote.entityTypes[0]} (${id}). Ensure data is synced or in state.`
    );
  }
}

/**
 * Sync all buffers matching the remote's entity types
 */
function performBulkBufferSync(listenerApi: BufferListenerApi, remote: BufferSyncRemote) {
  const state = listenerApi.getState();
  const bufferState = state[BUFFER_SLICE_NAME];

  const allBuffers = Object.values(bufferState.entities).filter(
    (buffer): buffer is BufferEntry => buffer !== undefined && remote.entityTypes.includes(buffer.entityType)
  );

  for (const buffer of allBuffers) {
    if (!buffer.referenceId) continue;

    const remoteData = remote.selectData(state, buffer.referenceId);
    if (remoteData !== undefined) {
      listenerApi.dispatch(
        bufferActions.syncFromSource({
          referenceId: buffer.referenceId,
          sourceData: remoteData,
        })
      );
    }
  }
}

export const bufferListenerMiddleware = createListenerMiddleware();

const startAppListening = bufferListenerMiddleware.startListening as TypedStartListening<
  ApiClientStoreState,
  Dispatch<AnyAction>
>;

startAppListening({
  predicate: (action) => {
    return action.type === "entities/synced" || remotes.some((remote) => remote.shouldHandleAction(action));
  },

  effect: (action, listenerApi) => {
    if (action.type === "entities/synced") {
      const { entityId, entityType, data } = action.payload as EntitySyncedPayload;
      const remote = remotes.find((r) => r.entityTypes.includes(entityType));

      if (!remote || !entityId) return;

      performBufferSync(listenerApi, remote, entityId, data);
      return;
    }

    const remote = remotes.find((r) => r.shouldHandleAction(action));
    if (!remote) return;

    const id = remote.extractId(action);

    // If no id found, sync all buffers for this entity type
    if (!id) {
      performBulkBufferSync(listenerApi, remote);
      return;
    }

    performBufferSync(listenerApi, remote, id);
  },
});

export const bufferSyncMiddleware = bufferListenerMiddleware.middleware;
