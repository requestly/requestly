import { createSelector } from "@reduxjs/toolkit";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { liveRunResultsAdapter, LiveRunResultsSliceState } from "./slice";
import { CollectionRunCompositeId } from "../common/runResults/types";
import { LiveRunResultSummary } from "./types";
import { EntityNotFound } from "../types";

const selectLiveRunResultsSlice = (state: ApiClientStoreState): LiveRunResultsSliceState => state.liveRunResults;

const adapterSelectors = liveRunResultsAdapter.getSelectors(selectLiveRunResultsSlice);

export const selectLiveRunResultById = adapterSelectors.selectById;

export const selectAllLiveRunResults = adapterSelectors.selectAll;

export const selectLiveRunResultEntities = adapterSelectors.selectEntities;

export const makeSelectLiveRunResultById = () =>
  createSelector(
    [selectLiveRunResultEntities, (_state: ApiClientStoreState, id: CollectionRunCompositeId) => id],
    (entities, id) => entities[id] ?? null
  );

export const makeSelectLiveRunResultIterations = () =>
  createSelector(
    [selectLiveRunResultEntities, (_state: ApiClientStoreState, id: CollectionRunCompositeId) => id],
    (entities, id) => {
      const entry = entities[id];
      return entry?.iterations ?? null;
    }
  );

export const makeSelectLiveRunResultStartTime = () =>
  createSelector(
    [selectLiveRunResultEntities, (_state: ApiClientStoreState, id: CollectionRunCompositeId) => id],
    (entities, id) => {
      const entry = entities[id];
      return entry?.startTime ?? null;
    }
  );

export const makeSelectLiveRunResultRunStatus = () =>
  createSelector(
    [selectLiveRunResultEntities, (_state: ApiClientStoreState, id: CollectionRunCompositeId) => id],
    (entities, id) => {
      const entry = entities[id];
      return entry?.runStatus ?? null;
    }
  );

export const makeSelectLiveRunResultError = () =>
  createSelector(
    [selectLiveRunResultEntities, (_state: ApiClientStoreState, id: CollectionRunCompositeId) => id],
    (entities, id) => {
      const entry = entities[id];
      return entry?.error ?? null;
    }
  );

export const makeSelectLiveRunResultCurrentlyExecutingRequest = () =>
  createSelector(
    [selectLiveRunResultEntities, (_state: ApiClientStoreState, id: CollectionRunCompositeId) => id],
    (entities, id) => {
      const entry = entities[id];
      return entry?.currentlyExecutingRequest ?? null;
    }
  );

export const makeSelectLiveRunResultSummary = () =>
  createSelector(
    [selectLiveRunResultEntities, (_state: ApiClientStoreState, id: CollectionRunCompositeId) => id],
    (entities, id): LiveRunResultSummary | null => {
      const entry = entities[id];
      if (!entry) return null;

      return {
        startTime: entry.startTime,
        endTime: entry.endTime,
        runStatus: entry.runStatus,
        iterations: entry.iterations,
      };
    }
  );

// Simple selectors that can be used directly with useApiClientSelector
export const selectLiveRunResultIterations = (state: ApiClientStoreState, id: CollectionRunCompositeId) => {
  const entry = selectLiveRunResultEntities(state)[id];
  return entry?.iterations ?? null;
};

export const selectLiveRunResultStartTime = (state: ApiClientStoreState, id: CollectionRunCompositeId) => {
  const entry = selectLiveRunResultEntities(state)[id];
  return entry?.startTime ?? null;
};

export const selectLiveRunResultRunStatus = (state: ApiClientStoreState, id: CollectionRunCompositeId) => {
  const entry = selectLiveRunResultEntities(state)[id];
  return entry?.runStatus ?? null;
};

export const selectLiveRunResultError = (state: ApiClientStoreState, id: CollectionRunCompositeId) => {
  const entry = selectLiveRunResultEntities(state)[id];
  return entry?.error ?? null;
};

export const selectLiveRunResultCurrentlyExecutingRequest = (
  state: ApiClientStoreState,
  id: CollectionRunCompositeId
) => {
  const entry = selectLiveRunResultEntities(state)[id];
  return entry?.currentlyExecutingRequest ?? null;
};

export const selectLiveRunResultSummary = (
  state: ApiClientStoreState,
  id: CollectionRunCompositeId
): LiveRunResultSummary => {
  const entry = selectLiveRunResultEntities(state)[id];

  if (!entry) {
    throw new EntityNotFound(id, "Live collection run result summary not found!");
  }

  return {
    startTime: entry.startTime,
    endTime: entry.endTime,
    runStatus: entry.runStatus,
    iterations: entry.iterations,
  };
};
