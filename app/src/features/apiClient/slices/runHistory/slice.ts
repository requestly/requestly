import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { NativeError } from "errors/NativeError";
import type { RQAPI } from "features/apiClient/types";
import { API_CLIENT_RUN_HISTORY_SLICE_NAME } from "../common/constants";
import { RunResult } from "../common/runResults";
import { RunHistorySaveStatus, RunHistoryEntry } from "./types";

export const runHistoryAdapter = createEntityAdapter<RunHistoryEntry>({
  selectId: (entry) => entry.collectionId,
});

export type RunHistorySliceState = ReturnType<typeof runHistoryAdapter.getInitialState>;

const HistorySaveStateMachine = {
  [RunHistorySaveStatus.IDLE]: [RunHistorySaveStatus.IDLE, RunHistorySaveStatus.SAVING],
  [RunHistorySaveStatus.SAVING]: [RunHistorySaveStatus.IDLE, RunHistorySaveStatus.SUCCESS, RunHistorySaveStatus.FAILED],
  [RunHistorySaveStatus.SUCCESS]: [RunHistorySaveStatus.IDLE],
  [RunHistorySaveStatus.FAILED]: [RunHistorySaveStatus.IDLE],
};

export class InvalidHistorySaveStateTransition extends NativeError {}

export const runHistorySlice = createSlice({
  name: API_CLIENT_RUN_HISTORY_SLICE_NAME,
  initialState: runHistoryAdapter.getInitialState(),
  reducers: {
    init(state, action: PayloadAction<{ collectionId: RunHistoryEntry["collectionId"] }>) {
      const { collectionId } = action.payload;
      const entry = state.entities[collectionId];
      if (entry) {
        return;
      }

      runHistoryAdapter.addOne(state, { collectionId, status: RunHistorySaveStatus.IDLE, history: [], error: null });
    },

    setHistoryStatus(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        status: RunHistorySaveStatus;
        error?: RunHistoryEntry["error"];
      }>
    ) {
      const { collectionId, ...changes } = action.payload;

      const entry = state.entities[collectionId];
      if (!entry) {
        throw new NativeError("Run history not found!").addContext({ collectionId });
      }

      const isStateChangeAllowed = HistorySaveStateMachine[entry.status].includes(changes.status);
      if (!isStateChangeAllowed) {
        throw new NativeError(`Invalid run history save state change from ${entry.status} to ${changes.status}`);
      }

      runHistoryAdapter.updateOne(state, { id: collectionId, changes });
    },

    // Add single entry to history (like Zustand's addToHistory)
    addHistoryEntry(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        entry: RunResult;
      }>
    ) {
      const { collectionId, entry } = action.payload;

      const existingHistory = state.entities[collectionId];

      if (!existingHistory) {
        throw new NativeError("Run history not found!");
      }

      state.entities[collectionId]?.history.push(entry);
    },

    addHistoryEntries(state, action: PayloadAction<RunHistoryEntry>) {
      runHistoryAdapter.addOne(state, action.payload);
    },
  },
});

export const runHistoryActions = runHistorySlice.actions;
export const runHistoryReducer = runHistorySlice.reducer;
export const runHistoryAdapterSelectors = runHistoryAdapter.getSelectors();
