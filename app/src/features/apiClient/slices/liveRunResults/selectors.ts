import { createSelector } from "@reduxjs/toolkit";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { liveRunResultsAdapter, LiveRunResultsSliceState } from "./slice";
import { EntityNotFound } from "../types";
import type { RQAPI } from "features/apiClient/types";
import { RunStatus } from "./types";

const selectLiveRunResultsSlice = (state: ApiClientStoreState): LiveRunResultsSliceState => state.liveRunResults;

const adapterSelectors = liveRunResultsAdapter.getSelectors(selectLiveRunResultsSlice);

export const selectLiveRunResultById = adapterSelectors.selectById;

export const selectAllLiveRunResults = adapterSelectors.selectAll;

export const selectLiveRunResultEntities = adapterSelectors.selectEntities;

export const selectLiveRunResultByCollectionId = (
  state: ApiClientStoreState,
  collectionId: RQAPI.CollectionRecord["id"]
) => {
  return selectLiveRunResultEntities(state)[collectionId] ?? null;
};

export const makeSelectLiveRunResultByCollectionId = () =>
  createSelector(
    [
      selectLiveRunResultEntities,
      (_state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => collectionId,
    ],
    (entities, collectionId) => entities[collectionId] ?? null
  );

export const makeSelectLiveRunResultIterations = () =>
  createSelector(
    [
      selectLiveRunResultEntities,
      (_state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => collectionId,
    ],
    (entities, collectionId) => {
      const entry = entities[collectionId];
      return entry?.iterations ?? null;
    }
  );

export const makeSelectLiveRunResultStartTime = () =>
  createSelector(
    [
      selectLiveRunResultEntities,
      (_state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => collectionId,
    ],
    (entities, collectionId) => {
      const entry = entities[collectionId];
      return entry?.startTime ?? null;
    }
  );

export const makeSelectLiveRunResultRunStatus = () =>
  createSelector(
    [
      selectLiveRunResultEntities,
      (_state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => collectionId,
    ],
    (entities, collectionId) => {
      const entry = entities[collectionId];
      return entry?.runStatus ?? null;
    }
  );

export const makeSelectLiveRunResultError = () =>
  createSelector(
    [
      selectLiveRunResultEntities,
      (_state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => collectionId,
    ],
    (entities, collectionId) => {
      const entry = entities[collectionId];
      return entry?.error ?? null;
    }
  );

export const makeSelectLiveRunResultCurrentlyExecutingRequest = () =>
  createSelector(
    [
      selectLiveRunResultEntities,
      (_state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => collectionId,
    ],
    (entities, collectionId) => {
      const entry = entities[collectionId];
      return entry?.currentlyExecutingRequest ?? null;
    }
  );

export const makeSelectLiveRunResultSummary = () =>
  createSelector(
    [
      selectLiveRunResultEntities,
      (_state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => collectionId,
    ],
    (entities, collectionId) => {
      const entry = entities[collectionId];
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
  return entry?.runStatus ?? null;
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
    throw new EntityNotFound(collectionId, "Live collection run result summary not found!");
  }

  return {
    startTime: entry.startTime ?? 0,
    endTime: entry.endTime ?? 0,
    runStatus: entry.runStatus as RunStatus.CANCELLED | RunStatus.COMPLETED,
    iterations: entry.iterations,
  };
};
