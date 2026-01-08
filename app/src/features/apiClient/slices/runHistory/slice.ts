import { createSlice, createEntityAdapter, PayloadAction, EntityState } from "@reduxjs/toolkit";
import { NativeError } from "errors/NativeError";
import type { RQAPI } from "features/apiClient/types";
import type { RunHistoryEntry } from "./types";
import { HistorySaveStatus } from "./types";
import { API_CLIENT_RUN_HISTORY_SLICE_NAME } from "../common/constants";

export const runHistoryAdapter = createEntityAdapter<RunHistoryEntry>({
  selectId: (entry) => entry.id,
  sortComparer: (a, b) => (b.startTime || 0) - (a.startTime || 0), // Newest first
});

export type RunHistoryListStatus = "idle" | "loading" | "success" | "error";

export interface CollectionHistoryBucket {
  entries: EntityState<RunHistoryEntry>;
  status: RunHistoryListStatus;
  error: string | null;
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
    // Load history from API (replaces existing)
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
      }>
    ) {
      const { collectionId, entries } = action.payload;
      const bucket = ensureBucket(state, collectionId);

      runHistoryAdapter.setAll(bucket.entries, entries);
      bucket.status = "success";
      bucket.error = null;
    },

    loadHistoryFailure(state, action: PayloadAction<{ collectionId: RQAPI.CollectionRecord["id"]; error: string }>) {
      const bucket = ensureBucket(state, action.payload.collectionId);
      bucket.status = "error";
      bucket.error = action.payload.error;
    },

    // Add single entry to history (like Zustand's addToHistory)
    addHistoryEntry(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        entry: RunHistoryEntry;
      }>
    ) {
      const { collectionId, entry } = action.payload;
      const bucket = ensureBucket(state, collectionId);

      runHistoryAdapter.addOne(bucket.entries, entry);
    },

    addHistoryEntries(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        entries: RunHistoryEntry[];
      }>
    ) {
      const { collectionId, entries } = action.payload;
      const bucket = ensureBucket(state, collectionId);

      runHistoryAdapter.addMany(bucket.entries, entries);
    },

    // Remove old entries beyond a limit
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

    // Clear all history for a collection
    clearHistory(state, action: PayloadAction<{ collectionId: RQAPI.CollectionRecord["id"] }>) {
      const { collectionId } = action.payload;
      const bucket = state.collections[collectionId];
      if (bucket) {
        runHistoryAdapter.removeAll(bucket.entries);
      }
    },

    // History save status management (matches Zustand's setHistorySaveStatus)
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
