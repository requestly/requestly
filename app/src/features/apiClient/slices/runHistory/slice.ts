import { createSlice, createEntityAdapter, PayloadAction, EntityState } from "@reduxjs/toolkit";
import { NativeError } from "errors/NativeError";
import type { RQAPI } from "features/apiClient/types";
import type { RunHistoryEntry } from "./types";
import { HistorySaveStatus } from "./types";
import { API_CLIENT_RUN_HISTORY_SLICE_NAME } from "../common/constants";

export const runHistoryAdapter = createEntityAdapter<RunHistoryEntry>({
  selectId: (entry) => entry.id,
  sortComparer: (a, b) => (b.startTime || 0) - (a.startTime || 0),
});

export type RunHistoryListStatus = "idle" | "loading" | "success" | "error";

export interface RunHistoryPaginationState {
  cursor: string | null;
  hasMore: boolean;
}

export interface CollectionHistoryBucket {
  entries: EntityState<RunHistoryEntry>;
  status: RunHistoryListStatus;
  error: string | null;
  pagination: RunHistoryPaginationState;
}

export interface RunHistorySliceState {
  collections: Record<RQAPI.CollectionRecord["id"], CollectionHistoryBucket>;
  historySaveStatus: HistorySaveStatus;
  historySaveError: string | null;
}

export const HistorySaveStateMachine: Record<HistorySaveStatus, readonly HistorySaveStatus[]> = {
  [HistorySaveStatus.IDLE]: [HistorySaveStatus.IDLE, HistorySaveStatus.SAVING],
  [HistorySaveStatus.SAVING]: [HistorySaveStatus.IDLE, HistorySaveStatus.SUCCESS, HistorySaveStatus.FAILED],
  [HistorySaveStatus.SUCCESS]: [HistorySaveStatus.IDLE],
  [HistorySaveStatus.FAILED]: [HistorySaveStatus.IDLE],
};

export class InvalidHistorySaveStateTransition extends NativeError {}

const createEmptyBucket = (): CollectionHistoryBucket => ({
  entries: runHistoryAdapter.getInitialState(),
  status: "idle",
  error: null,
  pagination: { cursor: null, hasMore: true },
});

const ensureBucket = (
  state: RunHistorySliceState,
  collectionId: RQAPI.CollectionRecord["id"]
): CollectionHistoryBucket => {
  if (!state.collections[collectionId]) {
    state.collections[collectionId] = createEmptyBucket();
  }

  return state.collections[collectionId];
};

const initialState: RunHistorySliceState = {
  collections: {},
  historySaveStatus: HistorySaveStatus.IDLE,
  historySaveError: null,
};

export const runHistorySlice = createSlice({
  name: API_CLIENT_RUN_HISTORY_SLICE_NAME,
  initialState,
  reducers: {
    loadHistoryRequested(state, action: PayloadAction<{ collectionId: RQAPI.CollectionRecord["id"] }>) {
      const bucket = ensureBucket(state, action.payload.collectionId);
      bucket.status = "loading";
      bucket.error = null;
    },

    loadHistorySuccess(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        entries: RunHistoryEntry[];
        pagination?: Partial<RunHistoryPaginationState>;
        mergeStrategy?: "replace" | "append" | "prepend";
      }>
    ) {
      const { collectionId, entries, pagination, mergeStrategy = "replace" } = action.payload;
      const bucket = ensureBucket(state, collectionId);

      if (mergeStrategy === "replace") {
        runHistoryAdapter.setAll(bucket.entries, entries);
      } else if (mergeStrategy === "prepend") {
        runHistoryAdapter.upsertMany(bucket.entries, entries);
      } else {
        runHistoryAdapter.upsertMany(bucket.entries, entries);
      }

      bucket.status = "success";
      bucket.error = null;
      bucket.pagination = {
        cursor: pagination?.cursor ?? bucket.pagination.cursor,
        hasMore: pagination?.hasMore ?? bucket.pagination.hasMore,
      };
    },

    loadHistoryFailure(state, action: PayloadAction<{ collectionId: RQAPI.CollectionRecord["id"]; error: string }>) {
      const bucket = ensureBucket(state, action.payload.collectionId);
      bucket.status = "error";
      bucket.error = action.payload.error;
    },

    addHistoryEntry(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        entry: RunHistoryEntry;
        limit?: number;
      }>
    ) {
      const { collectionId, entry, limit } = action.payload;
      const bucket = ensureBucket(state, collectionId);

      runHistoryAdapter.upsertOne(bucket.entries, entry);
      bucket.status = "success";
      bucket.error = null;

      if (typeof limit === "number" && limit >= 0 && bucket.entries.ids.length > limit) {
        const idsToRemove = bucket.entries.ids.slice(limit);
        runHistoryAdapter.removeMany(bucket.entries, idsToRemove);
      }
    },

    pruneHistory(state, action: PayloadAction<{ collectionId: RQAPI.CollectionRecord["id"]; keepLatest: number }>) {
      const { collectionId, keepLatest } = action.payload;
      if (keepLatest < 0) {
        return;
      }

      const bucket = ensureBucket(state, collectionId);
      if (bucket.entries.ids.length <= keepLatest) {
        return;
      }

      const idsToRemove = bucket.entries.ids.slice(keepLatest);
      runHistoryAdapter.removeMany(bucket.entries, idsToRemove);
    },

    setHistorySaveStatus(state, action: PayloadAction<{ status: HistorySaveStatus; error?: string | null }>) {
      const { status, error } = action.payload;
      const allowedTransitions = HistorySaveStateMachine[state.historySaveStatus];
      if (!allowedTransitions.includes(status)) {
        throw new InvalidHistorySaveStateTransition(
          `Invalid history save state change from ${state.historySaveStatus} to ${status}`
        );
      }

      state.historySaveStatus = status;
      state.historySaveError = status === HistorySaveStatus.FAILED ? error ?? null : null;
    },
  },
});

export const runHistoryActions = runHistorySlice.actions;
export const runHistoryReducer = runHistorySlice.reducer;

export const runHistoryAdapterSelectors = runHistoryAdapter.getSelectors();
