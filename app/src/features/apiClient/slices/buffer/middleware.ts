import {
  createListenerMiddleware,
  AnyAction,
  ListenerEffectAPI,
  Dispatch,
  TypedStartListening,
} from "@reduxjs/toolkit";
import { bufferActions, findBufferByReferenceId } from "./slice";
import { ApiClientEntityType } from "../entities/types";
import {
  API_CLIENT_RECORDS_SLICE_NAME,
  API_CLIENT_ENVIRONMENTS_SLICE_NAME,
  API_CLIENT_RUNNER_CONFIG_SLICE_NAME,
  BUFFER_SLICE_NAME,
  GLOBAL_ENVIRONMENT_ID,
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
  bulkActionTypes: string[];
  extractId: (action: AnyAction) => string | undefined;
  selectData: (state: ApiClientStoreState, id: string) => unknown | undefined;
}

const getPayloadId = (action: AnyAction): string | undefined => {
  const p = action.payload as any;
  if (p == null) return undefined;

  // PayloadAction<string>
  if (typeof p === "string") return p;

  // Common object payloads across our slices
  if (typeof p === "object") {
    return p.id ?? p.entityId ?? p.key ?? p.referenceId;
  }
  return undefined;
};

const recordsRemote: BufferSyncRemote = {
  entityTypes: [
    ApiClientEntityType.HTTP_RECORD,
    ApiClientEntityType.COLLECTION_RECORD,
    ApiClientEntityType.GRAPHQL_RECORD,
  ],
  shouldHandleAction: (action) => action.type.startsWith(`${API_CLIENT_RECORDS_SLICE_NAME}/`),
  bulkActionTypes: [
    `${API_CLIENT_RECORDS_SLICE_NAME}/upsertRecords`,
    `${API_CLIENT_RECORDS_SLICE_NAME}/setAllRecords`,
    `${API_CLIENT_RECORDS_SLICE_NAME}/hydrate`,
  ],
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
    // Selection changes shouldn't resync buffers; it's not a data mutation.
    const isNonMutatingAction = action.type === `${API_CLIENT_ENVIRONMENTS_SLICE_NAME}/setActiveEnvironment`;
    return isEnvAction && !isGlobalAction && !isNonMutatingAction;
  },
  bulkActionTypes: [
    `${API_CLIENT_ENVIRONMENTS_SLICE_NAME}/environmentsCreated`,
    `${API_CLIENT_ENVIRONMENTS_SLICE_NAME}/hydrate`,
  ],
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
  bulkActionTypes: [],
  extractId: () => GLOBAL_ENVIRONMENT_ID,
  selectData: (state) => state.environments.globalEnvironment,
};

const runtimeVariablesRemote: BufferSyncRemote = {
  entityTypes: [ApiClientEntityType.RUNTIME_VARIABLES],
  shouldHandleAction: (action) => false,
  bulkActionTypes: [],
  extractId: () => RUNTIME_VARIABLES_ENTITY_ID,
  selectData: () => undefined,
};

const runConfigRemote: BufferSyncRemote = {
  entityTypes: [ApiClientEntityType.RUN_CONFIG],
  shouldHandleAction: (action) => action.type.startsWith(`${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/`),
  bulkActionTypes: [
    `${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/upsertConfigs`,
    `${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/setAllConfigs`,
    `${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/removeConfigsForCollection`,
  ],
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

function syncAllOpenBuffersForRemote(listenerApi: BufferListenerApi, remote: BufferSyncRemote) {
  const state = listenerApi.getState();
  const bufferState = state[BUFFER_SLICE_NAME];

  const entries = Object.values(bufferState.entities);
  for (const entry of entries) {
    if (!entry?.referenceId) continue;
    if (!remote.entityTypes.includes(entry.entityType)) continue;
    performBufferSync(listenerApi, remote, entry.referenceId);
  }
}

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

    if (remote.bulkActionTypes.includes(action.type)) {
      syncAllOpenBuffersForRemote(listenerApi, remote);
      return;
    }

    const id = remote.extractId(action);
    if (!id) return;

    performBufferSync(listenerApi, remote, id);
  },
});

export const bufferSyncMiddleware = bufferListenerMiddleware.middleware;
