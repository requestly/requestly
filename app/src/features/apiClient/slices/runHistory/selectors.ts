import { createSelector } from "@reduxjs/toolkit";
import type { RQAPI } from "features/apiClient/types";
import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { RunResult } from "../common/runResults";
import { RunHistorySaveStatus } from "./types";
import { NativeError } from "errors/NativeError";

const selectRunHistoryState = (state: ApiClientStoreState) => state.runHistory;

const selectCollectionEntry = (state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => {
  return state.runHistory?.entities[collectionId] ?? null;
};

export const selectCollectionHistory = createSelector(
  [selectRunHistoryState, (_: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => collectionId],
  (state, collectionId): RunResult[] => {
    const entry = state?.entities[collectionId];

    if (!entry) {
      throw new NativeError("Run history entry not found!");
    }

    return entry.history;
  }
);

export const selectCollectionHistoryStatus = createSelector([selectCollectionEntry], (entry): RunHistorySaveStatus => {
  if (!entry) {
    throw new NativeError("Run history entry not found!");
  }

  return entry.status;
});
