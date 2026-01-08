import { createSlice, createEntityAdapter, PayloadAction, EntityState } from "@reduxjs/toolkit";
import { NativeError } from "errors/NativeError";
import type { CurrentlyExecutingRequest, LiveIterationMap } from "./types";
import type {
  CollectionRunCompositeId,
  RequestExecutionResult,
  RunMetadata,
  RunStatus,
  Timestamp,
} from "../common/runResults/types";
import { RunStatusStateMachine } from "../common/runResults/utils";
import { RunStatus as RunStatusEnum } from "../common/runResults/types";
import { API_CLIENT_LIVE_RUN_RESULT_SLICE_NAME } from "../common/constants";

export interface LiveRunEntryState extends RunMetadata {
  id: CollectionRunCompositeId;
  iterations: LiveIterationMap;
  currentlyExecutingRequest: CurrentlyExecutingRequest;
  abortController: AbortController | null;
  error: Error | null;
}

export const liveRunResultsAdapter = createEntityAdapter<LiveRunEntryState>({
  selectId: (entry) => entry.id,
});

export interface LiveRunResultsSliceState extends EntityState<LiveRunEntryState> {}

const initialState: LiveRunResultsSliceState = liveRunResultsAdapter.getInitialState();

export class InvalidLiveRunStateTransition extends NativeError {}

const createEmptyRunEntry = (compositeId: CollectionRunCompositeId): LiveRunEntryState => ({
  id: compositeId,
  startTime: null,
  endTime: null,
  runStatus: RunStatusEnum.IDLE,
  iterations: new Map(),
  currentlyExecutingRequest: null,
  abortController: new AbortController(),
  error: null,
});

const assertTransition = (current: RunStatus, next: RunStatus) => {
  const allowed = RunStatusStateMachine[current] as readonly RunStatus[];
  if (!allowed?.includes(next)) {
    throw new InvalidLiveRunStateTransition(`Invalid run state change from ${current} to ${next}`);
  }
};

const slice = createSlice({
  name: API_CLIENT_LIVE_RUN_RESULT_SLICE_NAME,
  initialState,
  reducers: {
    startRun(
      state,
      action: PayloadAction<{
        id: CollectionRunCompositeId;
        startTime?: Timestamp;
      }>
    ) {
      const { id, startTime } = action.payload;

      const entry: LiveRunEntryState = {
        ...createEmptyRunEntry(id),
        startTime: startTime ?? Date.now(),
        runStatus: RunStatusEnum.RUNNING,
      };

      liveRunResultsAdapter.setOne(state, entry);
    },

    setRunStatus(
      state,
      action: PayloadAction<{
        id: CollectionRunCompositeId;
        status: RunStatus;
        error?: Error | null;
      }>
    ) {
      const { id, status, error } = action.payload;
      const entry = state.entities[id];
      if (!entry) return;

      assertTransition(entry.runStatus, status);

      entry.runStatus = status;
      entry.error = status === RunStatusEnum.ERRORED ? error ?? null : null;
    },

    setCurrentlyExecutingRequest(
      state,
      action: PayloadAction<{
        id: CollectionRunCompositeId;
        request: CurrentlyExecutingRequest;
      }>
    ) {
      const { id, request } = action.payload;
      const entry = state.entities[id];
      if (!entry) return;

      entry.currentlyExecutingRequest = request;
    },

    addIterationResult(
      state,
      action: PayloadAction<{
        id: CollectionRunCompositeId;
        result: RequestExecutionResult;
      }>
    ) {
      const { id, result } = action.payload;
      const entry = state.entities[id];
      if (!entry) return;

      const iterationBucket = entry.iterations.get(result.iteration);

      if (!iterationBucket) {
        entry.iterations.set(result.iteration, { result: [result] });
      } else {
        iterationBucket.result.push(result);
      }
    },

    finalizeRun(
      state,
      action: PayloadAction<{
        id: CollectionRunCompositeId;
        status: Extract<RunStatus, RunStatusEnum.COMPLETED | RunStatusEnum.ERRORED | RunStatusEnum.CANCELLED>;
        endTime?: Timestamp;
        error?: Error | null;
      }>
    ) {
      const { id, status, endTime, error } = action.payload;
      const entry = state.entities[id];
      if (!entry) return;

      assertTransition(entry.runStatus, status);

      entry.runStatus = status;
      entry.endTime = endTime ?? Date.now();
      entry.currentlyExecutingRequest = null;
      entry.error = status === RunStatusEnum.ERRORED ? error ?? null : null;
    },

    resetRun(state, action: PayloadAction<{ id: CollectionRunCompositeId }>) {
      const { id } = action.payload;
      liveRunResultsAdapter.setOne(state, createEmptyRunEntry(id));
    },

    cancelRun(
      state,
      action: PayloadAction<{
        id: CollectionRunCompositeId;
        reason?: Error;
        cancelledAt?: Timestamp;
      }>
    ) {
      const { id, reason, cancelledAt } = action.payload;
      const entry = state.entities[id];
      if (!entry) return;

      assertTransition(entry.runStatus, RunStatusEnum.CANCELLED);

      entry.abortController?.abort();
      entry.runStatus = RunStatusEnum.CANCELLED;
      entry.endTime = cancelledAt ?? Date.now();
      entry.currentlyExecutingRequest = null;
      entry.error = reason ?? null;
    },

    clearAll(state) {
      liveRunResultsAdapter.removeAll(state);
    },
  },
});

export const liveRunResultsActions = slice.actions;
export const liveRunResultsReducer = slice.reducer;
export const liveRunResultsAdapterSelectors = liveRunResultsAdapter.getSelectors();
