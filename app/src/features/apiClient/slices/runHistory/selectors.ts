import { createSelector } from "@reduxjs/toolkit";
import type { RQAPI } from "features/apiClient/types";
import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { runHistoryAdapter, RunHistoryListStatus } from "./slice";
import type { RunHistoryEntry } from "./types";
import { HistorySaveStatus } from "./types";

// Base selectors
const selectRunHistoryState = (state: ApiClientStoreState) => state.runHistory;

const selectCollectionBucket = (state: ApiClientStoreState, collectionId: RQAPI.CollectionRecord["id"]) => {
  return state.runHistory?.collections[collectionId] ?? null;
};

// Collection history selectors
export const selectCollectionHistory = createSelector([selectCollectionBucket], (bucket) => {
  if (!bucket) {
    return [];
  }
  return runHistoryAdapter.getSelectors().selectAll(bucket.entries);
});

export const selectCollectionHistoryById = createSelector(
  [selectCollectionBucket, (_state: ApiClientStoreState, _collectionId: string, historyId: string) => historyId],
  (bucket, historyId): RunHistoryEntry | null => {
    if (!bucket) {
      return null;
    }
    return runHistoryAdapter.getSelectors().selectById(bucket.entries, historyId) ?? null;
  }
);

export const selectCollectionHistoryStatus = createSelector(
  [selectCollectionBucket],
  (bucket): RunHistoryListStatus => {
    return bucket?.status ?? "idle";
  }
);

export const selectCollectionHistoryError = createSelector([selectCollectionBucket], (bucket): string | null => {
  return bucket?.error ?? null;
});

export const selectCollectionHistoryCount = createSelector([selectCollectionBucket], (bucket): number => {
  return bucket?.entries.ids.length ?? 0;
});

export const selectIsCollectionHistoryLoading = createSelector(
  [selectCollectionHistoryStatus],
  (status): boolean => status === "loading"
);

export const selectIsCollectionHistoryLoaded = createSelector(
  [selectCollectionHistoryStatus],
  (status): boolean => status === "success"
);

export const selectHasCollectionHistoryError = createSelector(
  [selectCollectionHistoryStatus],
  (status): boolean => status === "error"
);

// Latest history entry
export const selectLatestHistoryEntry = createSelector([selectCollectionHistory], (history): RunHistoryEntry | null => {
  return history.length > 0 ? history[0] ?? null : null;
});

// History save status selectors
export const selectHistorySaveStatus = createSelector(
  [selectRunHistoryState],
  (state): HistorySaveStatus => {
    return state?.historySaveStatus ?? HistorySaveStatus.IDLE;
  }
);

export const selectHistorySaveError = createSelector([selectRunHistoryState], (state): string | null => {
  return state?.historySaveError ?? null;
});

export const selectIsHistorySaving = createSelector(
  [selectHistorySaveStatus],
  (status): boolean => status === HistorySaveStatus.SAVING
);

export const selectIsHistorySaveSuccess = createSelector(
  [selectHistorySaveStatus],
  (status): boolean => status === HistorySaveStatus.SUCCESS
);

export const selectIsHistorySaveFailed = createSelector(
  [selectHistorySaveStatus],
  (status): boolean => status === HistorySaveStatus.FAILED
);

// Helper hook-friendly selector creators
export const makeSelectCollectionHistory = (collectionId: RQAPI.CollectionRecord["id"]) =>
  createSelector([selectRunHistoryState], (state) => {
    const bucket = state.collections[collectionId] ?? null;
    if (!bucket) {
      return [];
    }
    return runHistoryAdapter.getSelectors().selectAll(bucket.entries);
  });

export const makeSelectCollectionHistoryStatus = (collectionId: RQAPI.CollectionRecord["id"]) =>
  createSelector(
    [selectRunHistoryState],
    (state): RunHistoryListStatus => {
      return state.collections[collectionId]?.status ?? "idle";
    }
  );
