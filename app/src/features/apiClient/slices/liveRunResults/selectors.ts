import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { liveRunResultsAdapter, LiveRunResultsSliceState } from "./slice";
import { EntityNotFound } from "../types";
import type { RQAPI } from "features/apiClient/types";
import { RunStatus } from "../common/runResults/types";
import { RunHistorySaveStatus } from "../runHistory/types";

const selectLiveRunResultsSlice = (state: ApiClientStoreState): LiveRunResultsSliceState => state.liveRunResults;

const adapterSelectors = liveRunResultsAdapter.getSelectors(selectLiveRunResultsSlice);

export const selectLiveRunResultEntities = adapterSelectors.selectEntities;

export const selectLiveRunResultByCollectionId = (
  state: ApiClientStoreState,
  collectionId: RQAPI.CollectionRecord["id"]
) => {
  return selectLiveRunResultEntities(state)[collectionId] ?? null;
};

// Simple selectors that can be used directly with useApiClientSelector
export const selectLiveRunResultIterations = (
  state: ApiClientStoreState,
  collectionId: RQAPI.CollectionRecord["id"]
) => {
  const entry = selectLiveRunResultEntities(state)[collectionId];
  return entry?.iterations ?? null;
};

export const selectLiveRunResultStartTime = (
  state: ApiClientStoreState,
  collectionId: RQAPI.CollectionRecord["id"]
) => {
  const entry = selectLiveRunResultEntities(state)[collectionId];
  return entry?.startTime ?? null;
};

export const selectLiveRunResultRunStatus = (
  state: ApiClientStoreState,
  collectionId: RQAPI.CollectionRecord["id"]
) => {
  const entry = selectLiveRunResultEntities(state)[collectionId];
  return entry?.runStatus ?? RunHistorySaveStatus.IDLE;
};

export const selectLiveRunResultError = (state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => {
  const entry = selectLiveRunResultEntities(state)[collectionId];
  return entry?.error ?? null;
};

export const selectLiveRunResultCurrentlyExecutingRequest = (
  state: ApiClientStoreState,
  collectionId: RQAPI.CollectionRecord["id"]
) => {
  const entry = selectLiveRunResultEntities(state)[collectionId];
  return entry?.currentlyExecutingRequest ?? null;
};

export const selectLiveRunResultSummary = (state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => {
  const entry = selectLiveRunResultEntities(state)[collectionId];

  if (!entry) {
    throw new EntityNotFound(collectionId, "LIVE_RUN_RESULT");
  }

  if (entry.runStatus !== RunStatus.CANCELLED && entry.runStatus !== RunStatus.COMPLETED) {
    throw new Error(`Expected terminal run status but got: ${entry.runStatus}`);
  }

  return {
    startTime: entry.startTime ?? 0,
    endTime: entry.endTime ?? 0,
    runStatus: entry.runStatus,
    iterations: entry.iterations,
  };
};
