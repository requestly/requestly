import { createListenerMiddleware } from "@reduxjs/toolkit";
import { bufferActions, bufferAdapterSelectors } from "./slice";
import type { ApiClientRootState } from "../hooks/types";
import { ApiClientEntityType } from "../entities/types";
import {
  API_CLIENT_RECORDS_SLICE_NAME,
  API_CLIENT_ENVIRONMENTS_SLICE_NAME,
  BUFFER_SLICE_NAME,
} from "../common/constants";
import { apiRecordsAdapter } from "../apiRecords/slice";
import { environmentsAdapter } from "../environments/slice";

type SourceSelectorMap = {
  [K in ApiClientEntityType]?: {
    selectById: (state: ApiClientRootState, id: string) => unknown | undefined;
    sliceName: string;
  };
};

type DirtySliceMap = Set<string>;

const BUFFER_SOURCE_SELECTORS: SourceSelectorMap = {
  [ApiClientEntityType.HTTP_RECORD]: {
    selectById: (state, id) => apiRecordsAdapter.getSelectors().selectById(state.records.records, id),
    sliceName: API_CLIENT_RECORDS_SLICE_NAME,
  },
  [ApiClientEntityType.COLLECTION_RECORD]: {
    selectById: (state, id) => apiRecordsAdapter.getSelectors().selectById(state.records.records, id),
    sliceName: API_CLIENT_RECORDS_SLICE_NAME,
  },
  [ApiClientEntityType.GRAPHQL_RECORD]: {
    selectById: (state, id) => apiRecordsAdapter.getSelectors().selectById(state.records.records, id),
    sliceName: API_CLIENT_RECORDS_SLICE_NAME,
  },
  [ApiClientEntityType.ENVIRONMENT]: {
    selectById: (state, id) => environmentsAdapter.getSelectors().selectById(state.environments.environments, id),
    sliceName: API_CLIENT_ENVIRONMENTS_SLICE_NAME,
  },
  [ApiClientEntityType.GLOBAL_ENVIRONMENT]: {
    selectById: (state) =>
      state.environments.globalEnvironment,
    sliceName: API_CLIENT_ENVIRONMENTS_SLICE_NAME,
  },    
};

const MONITORED_ROOT_SLICES: readonly string[] = [
  API_CLIENT_RECORDS_SLICE_NAME,
  API_CLIENT_ENVIRONMENTS_SLICE_NAME,
] as const;

function shouldRunSyncEffect(currentState: unknown, previousState: unknown): boolean {
  const current = currentState as ApiClientRootState;
  const previous = previousState as ApiClientRootState;

  return MONITORED_ROOT_SLICES.some((sliceName) => {
    const currentSlice = current[sliceName as keyof ApiClientRootState];
    const previousSlice = previous[sliceName as keyof ApiClientRootState];
    return currentSlice !== previousSlice;
  });
}

function buildDirtySliceMap(currentState: ApiClientRootState, previousState: ApiClientRootState): DirtySliceMap {
  const dirtySlices = new Set<string>();

  for (const sliceName of MONITORED_ROOT_SLICES) {
    const currentSlice = currentState[sliceName as keyof ApiClientRootState];
    const previousSlice = previousState[sliceName as keyof ApiClientRootState];

    if (currentSlice !== previousSlice) {
      dirtySlices.add(sliceName);
    }
  }

  return dirtySlices;
}

function syncActiveBuffers(listenerApi: {
  getState: () => unknown;
  getOriginalState: () => unknown;
  dispatch: (action: unknown) => unknown;
}) {
  const currentState = listenerApi.getState() as ApiClientRootState;
  const previousState = listenerApi.getOriginalState() as ApiClientRootState;

  const dirtySlices = buildDirtySliceMap(currentState, previousState);

  const bufferState = currentState[BUFFER_SLICE_NAME];
  const allBuffers = bufferAdapterSelectors.selectAll(bufferState);

  for (const buffer of allBuffers) {
    if (!buffer.referenceId) {
      continue;
    }

    const sourceSelector = BUFFER_SOURCE_SELECTORS[buffer.entityType];

    if (!sourceSelector) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[Buffer Sync] No selector registered for entity type: ${buffer.entityType}`);
      }
      continue;
    }

    if (!dirtySlices.has(sourceSelector.sliceName)) {
      continue;
    }

    const currentSourceData = sourceSelector.selectById(currentState, buffer.referenceId);
    const previousSourceData = sourceSelector.selectById(previousState, buffer.referenceId);

    if (currentSourceData !== previousSourceData && currentSourceData !== undefined) {
      listenerApi.dispatch(
        bufferActions.syncFromSource({
          referenceId: buffer.referenceId,
          sourceData: currentSourceData,
        })
      );
    }
  }
}

export const bufferListenerMiddleware = createListenerMiddleware();

bufferListenerMiddleware.startListening({
  predicate: (_action, currentState, previousState) => {
    return shouldRunSyncEffect(currentState, previousState);
  },

  effect: (_action, listenerApi) => {
    syncActiveBuffers(listenerApi);
  },
});

export const bufferSyncMiddleware = bufferListenerMiddleware.middleware;
