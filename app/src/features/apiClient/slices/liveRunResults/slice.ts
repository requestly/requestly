import { createSlice, createEntityAdapter, PayloadAction, EntityState } from "@reduxjs/toolkit";
import { NativeError } from "errors/NativeError";
import type { RQAPI } from "features/apiClient/types";
import type { CurrentlyExecutingRequest, LiveIterationMap } from "./types";
import type {
  CollectionRunCompositeId,
  RequestExecutionResult,
  RunMetadata,
  RunStatus,
  Timestamp,
} from "../common/runResults/types";
import { createCollectionRunCompositeId, RunStatusStateMachine } from "../common/runResults/utils";
import { RunStatus as RunStatusEnum } from "../common/runResults/types";
import { API_CLIENT_LIVE_RUN_RESULT_SLICE_NAME } from "../common/constants";

interface LiveRunEntryState extends RunMetadata {
  id: CollectionRunCompositeId;
  iterations: LiveIterationMap;
  currentlyExecutingRequest: CurrentlyExecutingRequest;
  abortController: AbortController | null;
  error: Error | null;
}

export const liveRunResultsAdapter = createEntityAdapter<LiveRunEntryState>({
  selectId: (entry) => entry.id,
});

interface LiveRunResultsSliceState extends EntityState<LiveRunEntryState> {}

const initialState: LiveRunResultsSliceState = liveRunResultsAdapter.getInitialState();

export class InvalidLiveRunStateTransition extends NativeError {}

const createEmptyRunEntry = (compositeId: CollectionRunCompositeId): LiveRunEntryState => ({
  id: compositeId,
  startTime: null,
  endTime: null,
  runStatus: RunStatusEnum.IDLE,
  iterations: new Map(),
  currentlyExecutingRequest: null,
  abortController: null,
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
        collectionId: RQAPI.CollectionRecord["id"];
        runId: string;
        startTime?: Timestamp;
        abortController?: AbortController;
      }>
    ) {
      const { collectionId, runId, startTime, abortController } = action.payload;
      const compositeId = createCollectionRunCompositeId(collectionId, runId);

      const entry: LiveRunEntryState = {
        ...createEmptyRunEntry(compositeId),
        startTime: startTime ?? Date.now(),
        runStatus: RunStatusEnum.RUNNING,
        abortController: abortController ?? new AbortController(),
      };

      liveRunResultsAdapter.setOne(state, entry);
    },

    setRunStatus(
      state,
      action: PayloadAction<{
        compositeId: CollectionRunCompositeId;
        status: RunStatus;
        error?: Error | null;
      }>
    ) {
      const { compositeId, status, error } = action.payload;
      const entry = state.entities[compositeId];
      if (!entry) return;

      assertTransition(entry.runStatus, status);

      entry.runStatus = status;
      entry.error = status === RunStatusEnum.ERRORED ? error ?? null : null;
    },

    setCurrentlyExecutingRequest(
      state,
      action: PayloadAction<{
        compositeId: CollectionRunCompositeId;
        request: CurrentlyExecutingRequest;
      }>
    ) {
      const { compositeId, request } = action.payload;
      const entry = state.entities[compositeId];
      if (!entry) return;

      entry.currentlyExecutingRequest = request;
    },

    addIterationResult(
      state,
      action: PayloadAction<{
        compositeId: CollectionRunCompositeId;
        result: RequestExecutionResult;
      }>
    ) {
      const { compositeId, result } = action.payload;
      const entry = state.entities[compositeId];
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
        compositeId: CollectionRunCompositeId;
        status: Extract<RunStatus, RunStatusEnum.COMPLETED | RunStatusEnum.ERRORED | RunStatusEnum.CANCELLED>;
        endTime?: Timestamp;
        error?: Error | null;
      }>
    ) {
      const { compositeId, status, endTime, error } = action.payload;
      const entry = state.entities[compositeId];
      if (!entry) return;

      assertTransition(entry.runStatus, status);

      entry.runStatus = status;
      entry.endTime = endTime ?? Date.now();
      entry.currentlyExecutingRequest = null;
      entry.error = status === RunStatusEnum.ERRORED ? error ?? null : null;
    },

    resetRun(state, action: PayloadAction<{ compositeId: CollectionRunCompositeId }>) {
      const { compositeId } = action.payload;
      liveRunResultsAdapter.setOne(state, createEmptyRunEntry(compositeId));
    },

    cancelRun(
      state,
      action: PayloadAction<{
        compositeId: CollectionRunCompositeId;
        reason?: Error;
        cancelledAt?: Timestamp;
      }>
    ) {
      const { compositeId, reason, cancelledAt } = action.payload;
      const entry = state.entities[compositeId];
      if (!entry) return;

      assertTransition(entry.runStatus, RunStatusEnum.CANCELLED);

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
